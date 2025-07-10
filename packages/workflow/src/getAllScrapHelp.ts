import type { Glossary, ScrapboxPage, ScrapboxProject, ScrapHelp } from '@repo/core'
import type { LoadGlossary, LoadScrapboxProject } from './publicTypes.js'
import { ok, Result, ResultAsync } from 'neverthrow'

import { replaceGlossaryTerms } from './helper/glossary.js'
import { expand } from './helper/parser.js'
import {
  helpfeelRegex,
  textHelpRegex,
  urlHelpRegex,
  urlHelpRegex2,
  urlHelpRegex3,
} from './helper/regex.js'

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
    || urlHelpRegex2.exec(help.content)?.[1]
    || urlHelpRegex3.exec(help.content)?.[1]
  if (url) {
    return ok({
      type: 'url',
      helpfeel: help.helpfeel,
      url: new URL(url),
    })
  }
  return ok({
    type: 'url',
    helpfeel: help.helpfeel,
    url: new URL(`https://scrapbox.io/${project.name}/${encodeURIComponent(page.title)}`),
  })
}

function validateHelpfeel(
  unvalidatedHelp: UnvalidatedHelp,
): Result<ScrapHelp[], Error> {
  const result = expand(unvalidatedHelp.helpfeel)
  return result.map(expanded => expanded.map(command => ({
    ...unvalidatedHelp,
    command,
  })))
}

function extractScrapHelp(glossary: Glossary, project: ScrapboxProject) {
  return Result.combine(project.pages
    .flatMap((page) => {
      return page.lines.map(x => x.text)
        .flatMap((text, index): MaybeHelp[] => {
          const helpfeel = helpfeelRegex.exec(text)?.[1]
          if (!helpfeel)
            return []
          const nextLine = page.lines[index + 1]?.text
          return [{
            helpfeel: replaceGlossaryTerms(helpfeel, glossary),
            content: nextLine && replaceGlossaryTerms(nextLine, glossary),
          }]
        })
        .map(validateContent.bind(null, project, page))
    }))
    .andThen(x => Result.combine(x.map(validateHelpfeel)))
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
