import type { FetchScrapboxPage } from '@repo/workflow'
import { ResultAsync } from 'neverthrow'
import { scrapboxApiUrl } from './helper/index.js'

interface ScrapboxPageResponse {
  id: string
  title: string
  image?: string
  created: number
  updated: number
  helpfeels: string[]
  lines: {
    id: string
    text: string
  }[]
}

export function setupFetchScrapboxPage(
  sid?: string,
): FetchScrapboxPage {
  return (projectName: string, pageTitle: string) =>
    ResultAsync.fromPromise(
      fetch(`${scrapboxApiUrl}/pages/${projectName}/${encodeURIComponent(pageTitle)}`, {
        headers: {
          ...(sid ? { Cookie: `connect.sid=${sid}` } : {}),
        },
      })
        .then(async response => await response.json() as ScrapboxPageResponse),
      (error) => {
        if (error instanceof Error) {
          return error
        }
        return new Error('Unknown error occurred while fetching project titles')
      },
    )
}
