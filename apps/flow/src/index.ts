import type { JSONRPCResponse } from './helper/index.js'
import {
  setupFetchProjectTitles,
  setupFetchScrapboxPage,
  setupLoadGlossary,
  setupLoadScrapboxProject,
  setupSaveScrapboxProject,
} from '@repo/gateway'
import { expand } from '@repo/parser'
import { getAllScrapHelp, updateScrapboxProjectCache } from '@repo/workflow'
import { ResultAsync } from 'neverthrow'
import { Flow, scrapboxLink, scrapboxUrl, search, urlToSubTitle } from './helper/index.js'

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
    { query: query.searchTerms.slice(1).join(' ') },
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
    .map(projects =>
      projects.map(project =>
        project.pages.map(page => page.helps.flatMap((help): JSONRPCResponse<AppMethods>[] => {
          switch (help.type) {
            case 'text': {
              return [
                {
                  title: help.command,
                  subTitle: help.text,
                  icoPath: 'assets/clipboard.png',
                  jsonRPCAction: {
                    method: 'copy_text',
                    parameters: [help.text],
                  },
                  contextData: [{
                    title: 'Open in Scrapbox',
                    subTitle: `/${project.project.name}/${page.page.title}`,
                    icoPath: 'assets/sticky-note.png',
                    jsonRPCAction: {
                      method: 'open_url',
                      parameters: [scrapboxUrl(project.project.name, page.page.title).toString()],
                    },
                  }],
                },
              ]
            }
            case 'url': {
              return [
                {
                  title: help.command,
                  subTitle: urlToSubTitle(help.url),
                  icoPath: help.url.hostname === 'scrapbox.io' ? 'assets/circle-help.png' : 'assets/globe.png',
                  jsonRPCAction: {
                    method: 'open_url',
                    parameters: [help.url.toString()],
                  },
                  contextData: [{
                    title: 'Copy Scrapbox Link',
                    subTitle: scrapboxLink(project.project.name, page.page.title),
                    icoPath: 'assets/clipboard.png',
                    jsonRPCAction: {
                      method: 'copy_text',
                      parameters: [scrapboxLink(project.project.name, page.page.title)],
                    },
                  }],
                },
              ]
            }
            default: {
              return []
            }
          }
        }).concat(
          {
            title: page.page.title,
            subTitle: `/${project.project.name}`,
            icoPath: 'assets/sticky-note.png',
            jsonRPCAction: {
              method: 'open_url',
              parameters: [scrapboxUrl(project.project.name, page.page.title).toString()],
            },
            contextData: [{
              title: 'Copy Scrapbox Link',
              subTitle: scrapboxLink(project.project.name, page.page.title),
              icoPath: 'assets/clipboard.png',
              jsonRPCAction: {
                method: 'copy_text',
                parameters: [scrapboxLink(project.project.name, page.page.title)],
              },
            }],
          },
        )),
      ).flat().flat(),
    )
    .map(x => search(x, query.search, item => item.title))
    .map(x => x.reduce(
      (acc, item) =>
        acc.some(
          x =>
            x.jsonRPCAction.method === item.jsonRPCAction.method
            && x.subTitle === item.subTitle
            && x.icoPath === item.icoPath,
        )
          ? acc
          : acc.concat(item),
      [] as JSONRPCResponse<AppMethods>[],
    ))

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
