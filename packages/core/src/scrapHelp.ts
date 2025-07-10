export interface UrlHelp {
  type: 'url'
  command: string
  url: URL
}

export interface TextHelp {
  type: 'text'
  command: string
  text: string
}

export type ScrapHelp = UrlHelp | TextHelp

export type Glossary = Record<string, string>
