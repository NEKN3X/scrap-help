export interface Project {
  id: string
  name: string
  pages: Page[]
}

export interface PageLine {
  id: string
  text: string
}

export interface Page {
  id: string
  title: string
  image?: string
  created: number
  updated: number
  helpfeels: string[]
  lines: PageLine[]
}
