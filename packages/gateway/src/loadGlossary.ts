import type { Glossary } from '@repo/core'
import type { LoadGlossary } from '@repo/workflow'
import type { Low } from 'lowdb'
import type { DataBase } from './lowdb/schema.js'
import { ResultAsync } from 'neverthrow'
import { db } from './lowdb/database.js'

const glossaryRegex = /^(.*):\s*`(.*)`$/

export function extractGlossary(lines: string[]): Glossary {
  return Object.fromEntries(
    lines
      .map(x => x.trim())
      .flatMap((x) => {
        const match = x.match(glossaryRegex)
        if (!match)
          return []
        return [[match[1]?.trim(), match[2]?.trim()]]
      }),
  )
}

export function emptyGlossary(): Glossary {
  return {}
}

export function setupLoadGlossary(
  glossaryProject: string,
  additional: Glossary = {},
  lowdb: Low<DataBase> = db,
): LoadGlossary {
  return () =>
    ResultAsync.fromSafePromise(lowdb.read())
      .map(() => lowdb.data)
      .map(({ projects }) => {
        const project = projects.find(p => p.name === glossaryProject)
        if (!project)
          return { ...emptyGlossary(), ...additional }
        const glossaryPage = project.pages.find(page => page.title.match(/glossary/i))
        if (!glossaryPage)
          return { ...emptyGlossary(), ...additional }
        return {
          ...extractGlossary(glossaryPage.lines.map(line => line.text)),
          ...additional,
        }
      })
}
