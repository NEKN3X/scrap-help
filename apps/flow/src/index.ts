import process from 'node:process'
import { setupLoadScrapboxProject } from '@repo/gateway'
import * as rpc from 'vscode-jsonrpc/node.js'

const connection = rpc.createMessageConnection(
  new rpc.StreamMessageReader(process.stdin),
  new rpc.StreamMessageWriter(process.stdout),
)

connection.onRequest('initialize', (_ctx) => {
  return {}
})

connection.onRequest('query', async (_query, _config) => {
  const result: never[] = []
  const getScrapboxProject = setupLoadScrapboxProject()
  const a = await getScrapboxProject('test')
  const b = a._unsafeUnwrap()
  connection.sendRequest('ShowMsg', {
    title: b.name,
  })
  return { result }
})

connection.listen()
