import type { ScrapboxPage, ScrapboxProject } from '@repo/core'
import type { ResultAsync } from 'neverthrow'

export type ScrapboxProjectTitles = {
  id: string
  title: string
  updated: number
}[]

// 最新のScrapboxProjectTitlesを取得する
export type GetLatestScrapboxProjectTitles = (projectName: string) => ResultAsync<ScrapboxProjectTitles, Error>

// キャッシュされたScrapboxProjectを取得する
export type GetCachedScrapboxProject = (projectName: string) => ResultAsync<ScrapboxProject, Error>

// 最新のScrapboxPageを取得する
export type GetLatestScrapboxPage = (projectName: string, pageTitle: string) => ResultAsync<ScrapboxPage, Error>

// キャッシュされたScrapboxProjectを更新する
export type UpdateCachedScrapboxProject = (project: ScrapboxProject) => ResultAsync<ScrapboxProject, Error>
