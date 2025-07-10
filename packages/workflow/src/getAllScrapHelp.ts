import type { Glossary, ScrapboxPage, ScrapboxProject, ScrapHelp } from '@repo/core'
import type { LoadGlossary, LoadScrapboxProject } from './publicTypes.js'
import { err, ok, Result, ResultAsync } from 'neverthrow'

import { replaceGlossaryTerms } from './helper/glossary.js'
import { expand } from './helper/parser.js'
import { helpContentRegex, helpfeelRegex, textHelpRegex, urlHelpRegex } from './helper/regex.js'

interface MaybeHelp {
  helpfeel: string
  content?: string
}

interface UnvalidatedTextHelp {
  type: 'text'
  helpfeel: string
  text: string
}

interface UnvalidatedUrlHelp {
  type: 'url'
  helpfeel: string
  url: URL
}

type UnvalidatedHelp = UnvalidatedTextHelp | UnvalidatedUrlHelp

function validateContent(
  project: ScrapboxProject,
  page: ScrapboxPage,
  help: MaybeHelp,
): Result<UnvalidatedHelp, Error> {
  if (!help.content) {
    return ok({
      type: 'url',
      helpfeel: help.helpfeel,
      url: new URL(`https://scrapbox.io/${project.name}/${encodeURIComponent(page.title)}`),
    })
  }
  const text = textHelpRegex.exec(help.content)?.[1]
  if (text) {
    return ok({
      type: 'text',
      helpfeel: help.helpfeel,
      text,
    })
  }
  const url = urlHelpRegex.exec(help.content)?.[1]
  if (url) {
    return ok({
      type: 'url',
      helpfeel: help.helpfeel,
      url: new URL(url),
    })
  }
  return err(new Error(`Invalid help content: ${help.content}`))
}

function validateHelpfeel(
  glossary: Glossary,
  unvalidatedHelp: UnvalidatedHelp,
): Result<ScrapHelp[], Error> {
  const helpfeel = replaceGlossaryTerms(unvalidatedHelp.helpfeel, glossary)
  const result = expand(helpfeel)
  return result.map(expanded => expanded.map(command => ({
    ...unvalidatedHelp,
    command,
  })))
}

function extractScrapHelp(glossary: Glossary, project: ScrapboxProject) {
  return Result.combine(project.pages
    .flatMap(page =>
      page.helpfeels
        .map((helpfeel): MaybeHelp => ({
          helpfeel,
          content: page.lines.find((line, index) =>
            page.lines[index - 1]?.text === helpfeel && helpContentRegex.test(line.text))?.text,
        }))
        .map(validateContent.bind(null, project, page))
        .map(x => x.andThen(help => validateHelpfeel(glossary, help))),
    ))
    .map(x => x.flat())
    .map(helps => ({ project, helps }))
}

export function getAllScrapHelp(
  loadScrapboxProjects: LoadScrapboxProject,
  loadGlossary: LoadGlossary,
) {
  return (projects: string[]) =>
    ResultAsync.combine([ResultAsync.combine(projects.map(loadScrapboxProjects)), loadGlossary()])
      .andThen(([projects, glossary]) =>
        (Result.combine(projects.flatMap(extractScrapHelp.bind(null, glossary))))
          .map(x => x.flat()))
}
