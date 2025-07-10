import type { Glossary, ScrapboxPage, ScrapboxProject, ScrapHelp } from '@repo/core'
import type { LoadGlossary, LoadScrapboxProject } from './publicTypes.js'
import { Result, ResultAsync } from 'neverthrow'

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

interface ProjectWithUnvalidatedHelps {
  project: ScrapboxProject
  pages: {
    page: ScrapboxPage
    helps: UnvalidatedHelp[]
  }[]
}

function validateContent(
  projectWithMaybeHelps: ProjectWithMaybeHelps,
): ProjectWithUnvalidatedHelps {
  return {
    project: projectWithMaybeHelps.project,
    pages: projectWithMaybeHelps.pages.map(page =>
      ({ page: page.page, helps: page.helps.map((help): UnvalidatedHelp => {
        const scrapboxUrl
          = `https://scrapbox.io/${projectWithMaybeHelps.project.name}/${encodeURIComponent(page.page.title)}`
        if (!help.content) {
          return ({
            type: 'url',
            helpfeel: help.helpfeel,
            url: new URL(scrapboxUrl),
          })
        }
        const text = textHelpRegex.exec(help.content)?.[1]
        if (text) {
          return ({
            type: 'text',
            helpfeel: help.helpfeel,
            text,
          })
        }
        const url = urlHelpRegex.exec(help.content)?.[1]
          || urlHelpRegex2.exec(help.content)?.[1]
          || urlHelpRegex3.exec(help.content)?.[1]
        if (url) {
          return ({
            type: 'url',
            helpfeel: help.helpfeel,
            url: new URL(url),
          })
        }
        return ({
          type: 'url',
          helpfeel: help.helpfeel,
          url: new URL(scrapboxUrl),
        })
      }) }),
    ),
  }
}

interface ProjectWithValidatedHelps {
  project: ScrapboxProject
  pages: {
    page: ScrapboxPage
    helps: ScrapHelp[]
  }[]
}

function validateHelpfeel(
  projectWithUnvalidatedHelps: ProjectWithUnvalidatedHelps,
): Result<ProjectWithValidatedHelps, Error> {
  return Result.combine(projectWithUnvalidatedHelps.pages.map(({ page, helps }) => (
    Result.combine(helps.map((unvalidatedHelp) => {
      const result = expand(unvalidatedHelp.helpfeel)
      return result.map(expanded => expanded.map(command => ({
        ...unvalidatedHelp,
        command,
      })))
    }))
      .map((x): ScrapHelp[] => x.flat())
      .map(helps => ({ page, helps }))
  )))
    .map(pages => ({ project: projectWithUnvalidatedHelps.project, pages }))
}

interface ProjectsWIthGlossary {
  projects: ScrapboxProject[]
  glossary: Glossary
}

interface ProjectWithMaybeHelps {
  project: ScrapboxProject
  pages: {
    page: ScrapboxPage
    helps: MaybeHelp[]
  }[]
}

function extractScrapHelp(projectsWithGlossary: ProjectsWIthGlossary): ProjectWithMaybeHelps[] {
  return projectsWithGlossary.projects.map(project => ({
    project,
    pages: project.pages.map(page => ({
      page,
      helps: page.lines.map(x => x.text)
        .flatMap((text, index): MaybeHelp[] => {
          const helpfeel = helpfeelRegex.exec(text)?.[1]
          if (!helpfeel)
            return []
          const nextLine = page.lines[index + 1]?.text
          return [{
            helpfeel: replaceGlossaryTerms(helpfeel, projectsWithGlossary.glossary),
            content: nextLine && replaceGlossaryTerms(nextLine, projectsWithGlossary.glossary),
          }]
        }),
    })),
  }))
}

export function getAllScrapHelp(
  loadScrapboxProjects: LoadScrapboxProject,
  loadGlossary: LoadGlossary,
) {
  return (projects: string[]) =>
    ResultAsync.combine(
      [ResultAsync.combine(projects.map(loadScrapboxProjects)), loadGlossary()],
    )
      .map(([projects, glossary]) => ({ projects, glossary }))
      .map(extractScrapHelp)
      .map(x => x.map(validateContent))
      .andThen(x => Result.combine(x.map(validateHelpfeel)))
}
