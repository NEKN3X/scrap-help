import type { ScrapboxPage, ScrapboxProject } from '@repo/core'
import type { ResultAsync } from 'neverthrow'
import type {
  GetCachedScrapboxProject,
  GetLatestScrapboxPage,
  GetLatestScrapboxProjectTitles,
  ScrapboxProjectTitles,
  UpdateCachedScrapboxProject,
} from './publicTypes'
import { errAsync, okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'
import { updateScrapboxProjectCache } from './updateProjectCache'

function getFromMap<K, V>(map: Map<K, V>, key: K): ResultAsync<V, Error> {
  const value = map.get(key)
  if (value === undefined) {
    return errAsync(new Error(`Key ${key} not found in map`))
  }
  return okAsync(value)
}

const now = Date.now()

const cachedProjectMap = new Map<string, ScrapboxProject>([
  ['test', {
    name: 'test',
    pages: [
      { id: '1', title: 'Title 1', helpfeels: [], lines: [], image: '', created: now - 10000, updated: now - 1000 },
      { id: '2', title: 'Title 2', helpfeels: [], lines: [], image: '', created: now - 10000, updated: now - 2000 },
      { id: '3', title: 'Title 3', helpfeels: [], lines: [], image: '', created: now - 10000, updated: now - 3000 },
    ],
  }],
])

const latestTitles = [
  { id: '1', title: 'Updated Title 1', updated: now },
  { id: '2', title: 'Updated Title 2', updated: now },
]

const latestProjectTitlesMap = new Map<string, ScrapboxProjectTitles>([
  ['test', latestTitles],
])
const latestPagesMap = new Map<string, ScrapboxPage>(latestTitles.map((title): [string, ScrapboxPage] => [
  title.title,
  { ...title, created: now - 10000, updated: title.updated, lines: [], helpfeels: [], image: '' },
]))

const latestProjectPagesMap = new Map<string, Map<string, ScrapboxPage>>([
  ['test', latestPagesMap],
])

const getLatestScrapboxProjectTitles: GetLatestScrapboxProjectTitles = (projectName: string) => {
  return getFromMap(latestProjectTitlesMap, projectName)
}

const getCachedScrapboxProject: GetCachedScrapboxProject = (projectName: string) => {
  return getFromMap(cachedProjectMap, projectName)
}

const getLatestScrapboxPage: GetLatestScrapboxPage = (projectName: string, pageTitle: string) => {
  return getFromMap(latestProjectPagesMap, projectName).andThen(pages => getFromMap(pages, pageTitle))
}

const updateCachedScrapboxProject: UpdateCachedScrapboxProject = (project: ScrapboxProject) => {
  return okAsync(project)
}

describe('updateScrapboxProjectCache', () => {
  it('should update cached project', async () => {
    const projectName = 'test'
    const workflow = updateScrapboxProjectCache(
      getLatestScrapboxProjectTitles,
      getCachedScrapboxProject,
      getLatestScrapboxPage,
      updateCachedScrapboxProject,
    )(projectName)
    const result = await workflow
    expect(result.isOk()).toBe(true)
    const value = result._unsafeUnwrap()
    expect(value).toEqual({
      name: 'test',
      pages: [
        { id: '1', title: 'Updated Title 1', helpfeels: [], lines: [], image: '', created: now - 10000, updated: now },
        { id: '2', title: 'Updated Title 2', helpfeels: [], lines: [], image: '', created: now - 10000, updated: now },
      ],
    })
  })
})
