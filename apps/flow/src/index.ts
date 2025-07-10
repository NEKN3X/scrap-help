import type { JSONRPCResponse } from './helper/index.js'
import {
  setupFetchProjectTitles,
  setupFetchScrapboxPage,
  setupLoadGlossary,
  setupLoadScrapboxProject,
  setupSaveScrapboxProject,
} from '@repo/gateway'
import { getAllScrapHelp, updateScrapboxProjectCache } from '@repo/workflow'
import { ResultAsync } from 'neverthrow'
import { Flow, search, urlToSubTitle } from './helper/index.js'

interface AppSettings {
  projects?: string
  sid?: string
  glossaryProject?: string
}

type AppMethods = 'open_url' | 'copy_text' | 'copy_file'

const flow = new Flow<AppMethods, AppSettings>()

flow.showResult(async (query, settings) => {
  const fetchScrapboxProjectTitles = setupFetchProjectTitles(settings.sid)
  const loadScrapboxProject = setupLoadScrapboxProject()
  const fetchScrapboxPage = setupFetchScrapboxPage(settings.sid)
  const saveScrapboxProject = setupSaveScrapboxProject()
  const loadGlossary = setupLoadGlossary(
    settings.glossaryProject ?? '',
    { query: query.searchTerms.slice(0).join(' ') },
  )
  const updateScrapboxProjectCacheWorkflow = updateScrapboxProjectCache(
    fetchScrapboxProjectTitles,
    loadScrapboxProject,
    fetchScrapboxPage,
    saveScrapboxProject,
  )
  const projects = settings.projects?.split(',') ?? []
  ResultAsync.combine(projects.map(project => updateScrapboxProjectCacheWorkflow(project)) ?? [])
  const result = await getAllScrapHelp(
    loadScrapboxProject,
    loadGlossary,
  )(projects)
    .map(projects => projects.map(project => project.helps.flatMap((help): JSONRPCResponse<AppMethods>[] => {
      switch (help.type) {
        case 'text': {
          return [
            {
              title: help.command,
              subTitle: help.text,
              jsonRPCAction: {
                method: 'copy_text',
                parameters: [help.text],
              },
            },
          ]
        }
        case 'url': {
          return [
            {
              title: help.command,
              subTitle: urlToSubTitle(help.url),
              jsonRPCAction: {
                method: 'open_url',
                parameters: [help.url.toString()],
              },
            },
          ]
        }
        default: {
          return []
        }
      }
    })).concat(
      projects.flatMap(projectWithHelps =>
        projectWithHelps.project.pages.map((page): JSONRPCResponse<AppMethods> => {
          const url = new URL(`https://scrapbox.io/${projectWithHelps.project.name}/${encodeURIComponent(page.title)}`)

          return {
            title: page.title,
            subTitle: `/${projectWithHelps.project.name}`,
            jsonRPCAction: {
              method: 'open_url',
              parameters: [url.toString()],
            },
          }
        }),
      ),
    ))
    .map(x => x.flat())
    .map(x => search(x, query.search, item => item.title))

  if (result.isOk()) {
    return result.value
  }
  return []
})

flow.on('open_url', async (params) => {
  const url = params[0] as string
  flow.openUrl(url)
})

flow.on('copy_text', async (params) => {
  const text = params[0] as string
  flow.copyToClipboard(text)
})

flow.run()
