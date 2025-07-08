import process from 'node:process'
import { hello } from '@repo/core'
import * as rpc from 'vscode-jsonrpc/node.js'

const connection = rpc.createMessageConnection(
  new rpc.StreamMessageReader(process.stdin),
  new rpc.StreamMessageWriter(process.stdout),
)

connection.onRequest('initialize', (_ctx) => {
  return {}
})

connection.onRequest('query', (_query, _config) => {
  const result: never[] = []
  connection.sendRequest('ShowMsg', {
    title: hello,
  })
  return { result }
})

connection.listen()
