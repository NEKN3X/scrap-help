export type DataBase = Documents

export function createDefaultData(): DataBase {
  return {
    projects: [],
  }
}

export interface Documents {
  projects: ProjectsSchema
}

export type ProjectsSchema = {
  name: string
  pages: {
    id: string
    title: string
    image?: string
    created: number
    updated: number
    helpfeels: string[]
    lines: {
      id: string
      text: string
    }[]
  }[]
}[]
