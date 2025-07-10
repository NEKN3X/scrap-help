export interface UrlHelp {
  command: string
  url: URL
}

export interface TextHelp {
  command: string
  text: string
}

export type ScrapHelp = UrlHelp | TextHelp

export type Glossary = Record<string, string>
