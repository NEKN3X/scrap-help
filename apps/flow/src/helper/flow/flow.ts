import type { MessageConnection } from 'vscode-jsonrpc'
import type {
  _Context,
  Context,
  IFlow,
  JSONRPCResponse,
  MatchResult,
  Method,
  Parameters,
  Query,
} from './types.js'
import process from 'node:process'
import * as rpc from 'vscode-jsonrpc/node.js'

export class Flow<TMethods, TSettings> implements IFlow<TMethods, TSettings> {
  private _context: Context = {} as Context
  private connection: MessageConnection

  constructor(init?: (ctx: Context) => Promise<void> | void) {
    this.connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(process.stdin),
      new rpc.StreamMessageWriter(process.stdout),
    )
    this.connection.onRequest('initialize', async (ctx: _Context) => {
      this._context = ctx.currentPluginMetadata
      await init?.(this._context)
      return {}
    })
  }

  public get context() {
    return this._context
  }

  public on(
    method: Method<TMethods>,
    handler: (params: Parameters) => Promise<void> | void,
  ): void {
    this.connection.onRequest(method, (params) => {
      handler(params)
      return {}
    })
  }

  public showResult(
    gen: (
      query: Query,
      settings: TSettings,
    ) => Promise<JSONRPCResponse<TMethods>[]> | JSONRPCResponse<TMethods>[],
  ): void {
    this.connection.onRequest(
      'query',
      async (query: Query, settings: TSettings) => {
        const result = await gen(query, settings)
        return { result }
      },
    )
  }

  public run(): void {
    this.connection.listen()
  }

  public changeQuery(query: string, requery: boolean): void {
    this.connection.sendRequest('ChangeQuery', { query, requery })
  }

  public copyToClipboard(text: string): void {
    this.connection.sendRequest('CopyToClipboard', text)
  }

  public async fuzzySearch(
    query: string,
    stringToCompare: string,
  ): Promise<MatchResult> {
    return await this.connection.sendRequest('FuzzySearch', {
      query,
      stringToCompare,
    })
  }

  public openUrl(url: string, inPrivate?: boolean): void {
    this.connection.sendRequest('OpenUrl', { inPrivate, url })
  }

  public showMessage(
    title: string,
    subTitle?: string,
    iconPath?: string,
  ): void {
    this.connection.sendRequest('ShowMsg', { iconPath, subTitle, title })
  }
}
