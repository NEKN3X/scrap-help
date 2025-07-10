import type { Glossary, ScrapboxPage, ScrapboxProject, ScrapHelp } from '@repo/core'
import type { LoadGlossary, LoadScrapboxProject } from './publicTypes.js'
import { err, ok, Result, ResultAsync } from 'neverthrow'

import { replaceGlossaryTerms } from './helper/glossary.js'
import { expand } from './helper/parser.js'
import { helpContentRegex, textHelpRegex } from './helper/regex.js'

interface MaybeHelp {
  helpfeel: string
  content?: string
}

interface UnvalidatedTextHelp {
  helpfeel: string
  text: string
}

interface UnvalidatedUrlHelp {
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
      helpfeel: help.helpfeel,
      url: new URL(`https://scrapbox.io/${project.name}/${encodeURIComponent(page.title)}`),
    })
  }
  const text = textHelpRegex.exec(help.content)
  if (text) {
    return ok({
      helpfeel: help.helpfeel,
      text: help.content,
    })
  }
  const url = helpContentRegex.exec(help.content)
  if (url) {
    return ok({
      helpfeel: help.helpfeel,
      url: new URL(help.content),
    })
  }
  return err(new Error(`Invalid help content: ${help.content}`))
}

function validateHelpfeel(
  unvalidatedHelp: UnvalidatedHelp,
  glossary: Glossary,
): Result<ScrapHelp[], Error> {
  const helpfeel = replaceGlossaryTerms(unvalidatedHelp.helpfeel, glossary)
  const result = expand(helpfeel)
  return result.map(expanded => expanded.map(command => ({
    ...unvalidatedHelp,
    command,
  })))
}

function extractScrapHelp(project: ScrapboxProject, glossary: Glossary) {
  return project.pages
    .flatMap(page =>
      page.helpfeels
        .map((helpfeel): MaybeHelp => ({
          helpfeel,
          content: page.lines.find((line, index) =>
            page.lines[index - 1]?.text === helpfeel && helpContentRegex.test(line.text))?.text,
        }))
        .map(validateContent.bind(null, project, page))
        .map(x => x.andThen(help => validateHelpfeel(help, glossary))),
    )
}

export function getAllScrapHelp(
  loadScrapboxProjects: LoadScrapboxProject,
  loadGlossary: LoadGlossary,
) {
  return (projects: string[]) =>
    ResultAsync.combine([ResultAsync.combine(projects.map(loadScrapboxProjects)), loadGlossary()])
      .andThen(([projects, glossary]) =>
        (Result.combine(projects.flatMap(project => extractScrapHelp(project, glossary)))))
}
