import type { JSONRPCResponse } from './helper/types.js'
import {
  setupFetchProjectTitles,
  setupFetchScrapboxPage,
  setupLoadGlossary,
  setupLoadScrapboxProject,
  setupSaveScrapboxProject,
} from '@repo/gateway'
import { getAllScrapHelp, updateScrapboxProjectCache } from '@repo/workflow'
import { ResultAsync } from 'neverthrow'
import { Flow } from './helper/index.js'

interface AppSettings {
  projects?: string
  sid?: string
  glossaryProject?: string
}

type AppMethods = 'open_url' | 'copy_text' | 'copy_file'

const flow = new Flow<AppMethods, AppSettings>()

flow.showResult(async (_query, settings) => {
  const fetchScrapboxProjectTitles = setupFetchProjectTitles(settings.sid)
  const loadScrapboxProject = setupLoadScrapboxProject()
  const fetchScrapboxPage = setupFetchScrapboxPage(settings.sid)
  const saveScrapboxProject = setupSaveScrapboxProject()
  const loadGlossary = setupLoadGlossary(settings.glossaryProject ?? '')
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
    .map(x => x.flat())
    .map(helps => helps.flatMap((help): JSONRPCResponse<AppMethods>[] => [
      {
        title: help.command,
        jsonRPCAction: {
          method: 'open_url',
          parameters: [],
        },
      },
    ]))

  if (result.isOk()) {
    return result.value
  }
  return []
})

flow.run()
