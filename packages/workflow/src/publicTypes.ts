import type { ScrapboxPage, ScrapboxProject } from '@repo/core'
import type { ResultAsync } from 'neverthrow'

export type ScrapboxProjectTitles = {
  id: string
  title: string
  updated: number
}[]

// 最新のScrapboxProjectTitlesを取得する
export type FetchScrapboxProjectTitles = (projectName: string) => ResultAsync<ScrapboxProjectTitles, Error>

// 最新のScrapboxPageを取得する
export type FetchScrapboxPage = (projectName: string, pageTitle: string) => ResultAsync<ScrapboxPage, Error>

// キャッシュされたScrapboxProjectを取得する
export type LoadScrapboxProject = (projectName: string) => ResultAsync<ScrapboxProject, Error>

// キャッシュされたScrapboxProjectを更新する
export type SaveScrapboxProject = (project: ScrapboxProject) => ResultAsync<ScrapboxProject, Error>
