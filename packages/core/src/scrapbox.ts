export interface ScrapboxProject {
  name: string
  pages: ScrapboxPage[]
}

export interface ScrapboxPageLine {
  id: string
  text: string
}

export interface ScrapboxPage {
  id: string
  title: string
  image?: string
  created: number
  updated: number
  helpfeels: string[]
  lines: ScrapboxPageLine[]
}
