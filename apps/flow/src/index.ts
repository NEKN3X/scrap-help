import { fetchProjectTitles } from '@repo/gateway'
import { Flow } from './helper/index.js'

interface AppSettings {
  projects?: string
  sid?: string
  glossaryProject?: string
}

type AppMethods = 'open_url' | 'copy_text' | 'copy_file'

const flow = new Flow<AppMethods, AppSettings>()

flow.showResult(async (query, settings) => {
  const { projects, sid, glossaryProject } = settings
  const result = await fetchProjectTitles(sid)('nekn3x')
  if (result.isOk()) {
    flow.showMessage(result._unsafeUnwrap().join(' '))
  }
  return []
})

flow.run()
