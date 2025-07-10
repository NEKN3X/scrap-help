import type { Glossary, ScrapboxPage, ScrapboxProject, ScrapHelp } from '@repo/core'
import type { LoadAllScrapboxProjects, LoadGlossary } from './publicTypes'
import { err, ok, okAsync, Result, ResultAsync } from 'neverthrow'

import { replaceGlossaryTerms } from './helper/glossary'
import { expand } from './helper/parser'
import { helpContentRegex, textHelpRegex } from './helper/regex'

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
  loadAllScrapboxProjects: LoadAllScrapboxProjects,
  loadGlossary: LoadGlossary,
) {
  return () =>
    ResultAsync.combine([loadAllScrapboxProjects(), loadGlossary()])
      .andThen(([projects, glossary]) =>
        (Result.combine(projects.flatMap(project => extractScrapHelp(project, glossary)))))
}
