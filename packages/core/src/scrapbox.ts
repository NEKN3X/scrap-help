export type Helpfeel = string

export type ProjectId = string
export type ProjectName = string

export interface Project {
  id: ProjectId
  name: ProjectName
  pages: Page[]
}

export type PageId = string
export type PageTitle = string
export type PageImage = string
export type PageCreated = number
export type PageUpdated = number

export type LineId = string
export type LineText = string
export interface PageLine {
  id: LineId
  text: LineText
}

export interface Page {
  id: PageId
  title: PageTitle
  image?: PageImage
  created: PageCreated
  updated: PageUpdated
  helpfeels: Helpfeel[]
  lines: PageLine[]
}
