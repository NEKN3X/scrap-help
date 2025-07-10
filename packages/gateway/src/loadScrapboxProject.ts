import type { LoadScrapboxProject } from '@repo/workflow'
import type { Low } from 'lowdb'
import type { DataBase } from './lowdb/schema.js'
import { ResultAsync } from 'neverthrow'
import { db } from './lowdb/database.js'

export function setupLoadScrapboxProject(lowdb: Low<DataBase> = db): LoadScrapboxProject {
  return (projectName: string) =>
    ResultAsync.fromSafePromise(lowdb.read())
      .map(() => lowdb.data)
      .map(({ projects }) => {
        const project = projects.find(p => p.name === projectName)
        if (!project) {
          return {
            name: projectName,
            pages: [],
          }
        }
        return project
      })
}
