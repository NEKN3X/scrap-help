export type MethodsObj<T> = {
  [key in T extends string ? T : string & {}]: () => void
}

export type ParametersAllowedTypes
  = | string
    | number
    | boolean
    | Record<string, unknown>
    | ParametersAllowedTypes[]

export type Method<T> = keyof MethodsObj<T>
export type Parameters = ParametersAllowedTypes[]

export interface JSONRPCResponse<TMethods> {
  title: string
  subTitle?: string
  glyph?: {
    glyph: string
    fontFamily: string
  }
  icoPath?: string
  jsonRPCAction: {
    method: Method<TMethods>
    parameters: Parameters
  }
  contextData?: JSONRPCResponse<TMethods>[]
  score?: number
}

export interface _Context {
  currentPluginMetadata: Context
}
export interface Context {
  id: string
  name: string
  author: string
  version: string
  language: string
  description: string
  website: string
  disabled: boolean
  homeDisabled: boolean
  executeFilePath: string
  executeFileName: string
  pluginDirectory: string
  actionKeyword: string
  actionKeywords: string[]
  hideActionKeywordPanel: boolean
  icoPath: string
  pluginSettingsDirectoryPath: string
  pluginCacheDirectoryPath: string
}

export interface Query {
  rawQuery: string
  isReQuery: boolean
  isHomeQuery: boolean
  search: string
  searchTerms: string[]
  actionKeyword: string
}

export interface IFlow<TMethods, TSettings> {
  context: Context
  on: (
    method: Method<TMethods>,
    handler: (params: Parameters) => Promise<void> | void,
  ) => void
  showResult: (
    gen: (query: Query, settings: TSettings) => JSONRPCResponse<TMethods>[],
  ) => void
  run: () => void
  changeQuery: (query: string, requery: boolean) => void
  copyToClipboard: (text: string) => void
  fuzzySearch: (query: string, stringToCompare: string) => Promise<MatchResult>
  openUrl: (url: string, inPrivate?: boolean) => void
}

export interface MatchResult {
  score: number
  matchData: number[]
  rawScore: number
  searchPrecision: 50 | 20 | 0
  success: boolean
}
