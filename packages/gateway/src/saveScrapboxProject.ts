import type { ScrapboxProject } from '@repo/core'
import type { SaveScrapboxProject } from '@repo/workflow'
import type { Low } from 'lowdb'
import type { DataBase } from './lowdb/schema.js'
import { ResultAsync } from 'neverthrow'
import { db } from './lowdb/database.js'

export function setupSaveScrapboxProject(lowdb: Low<DataBase> = db): SaveScrapboxProject {
  return (project: ScrapboxProject) =>
    ResultAsync.fromSafePromise(lowdb.read())
      .andTee(() => {
        const data = lowdb.data
        lowdb.data = {
          ...data,
          projects: data.projects.filter(p => p.name !== project.name).concat(project),
        }
        lowdb.write()
      })
      .map(() => project)
}
