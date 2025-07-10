import type { FetchScrapboxProjectTitles } from '@repo/workflow'
import { ResultAsync } from 'neverthrow'

type ProjectTitlesResponse = {
  id: string
  title: string
  links: string[]
  image?: string
  updated: number
}[]

export function fetchProjectTitles(
  sid?: string,
): FetchScrapboxProjectTitles {
  return (projectName: string) =>
    ResultAsync.fromPromise(
      fetch(`https://scrapbox.io/api/pages/${projectName}/search/titles`, {
        headers: {
          ...(sid ? { Cookie: `connect.sid=${sid}` } : {}),
        },
      })
        .then(async response => await response.json() as ProjectTitlesResponse),
      (error) => {
        if (error instanceof Error) {
          return error
        }
        return new Error('Unknown error occurred while fetching project titles')
      },
    )
}
