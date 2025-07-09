import type { Low } from 'lowdb'
import type { Documents, ProjectsSchema } from './lowdb/schema'
import { beforeEach, describe, expect, it } from 'vitest'
import { setupGetCachedScrapboxProject } from './getScrapboxProject'
import { setupDataBase } from './helper/database'

let mockDb: Low<Documents>

beforeEach(async () => {
  const db = await setupDataBase()
  mockDb = db
})

// テストデータを作る
function createTestData(data?: Partial<ProjectsSchema[number]>): ProjectsSchema[number] {
  return {
    name: data?.name || 'test',
    pages: data?.pages || [{
      id: '1',
      title: 'Test Page',
      image: '',
      created: Date.now(),
      updated: Date.now(),
      helpfeels: [],
      lines: [],
    }],
  }
}

// テストデータをデータをDBに保存する
async function fixture(data?: Partial<ProjectsSchema[number]>): Promise<ProjectsSchema[number]> {
  const testData = createTestData(data)
  await mockDb.read()
  const { projects } = mockDb.data
  projects.push(testData)
  await mockDb.write()
  return testData
}

describe('getCachedScrapboxProject', () => {
  it('should return project if exists', async () => {
    await fixture()
    const getCachedScrapboxProject = setupGetCachedScrapboxProject(mockDb)
    const result = await getCachedScrapboxProject('test')
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual({ name: 'test', pages: [{
      id: '1',
      title: 'Test Page',
      image: '',
      created: expect.any(Number),
      updated: expect.any(Number),
      helpfeels: [],
      lines: [],
    }] })
  })

  it('should return empty project if not exists', async () => {
    const getCachedScrapboxProject = setupGetCachedScrapboxProject(mockDb)
    const result = await getCachedScrapboxProject('nonexistent')
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual({ name: 'nonexistent', pages: [] })
  })
})
