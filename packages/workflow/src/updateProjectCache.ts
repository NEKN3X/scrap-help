import type { ScrapboxPage, ScrapboxProject } from '@repo/core'
import type {
  FetchScrapboxPage,
  FetchScrapboxProjectTitles,
  LoadScrapboxProject,
  SaveScrapboxProject,
  ScrapboxProjectTitles,
} from './publicTypes.js'
import { ResultAsync } from 'neverthrow'

// 最新のScrapboxProjectTitlesとのペア
interface ProjectWithLatestTitles {
  cachedProject: ScrapboxProject
  latestTitles: ScrapboxProjectTitles
}

// 更新されていることを確認したScrapboxProjectTitlesとのペア
interface ProjectWithUpdatedTitles {
  cachedProject: ScrapboxProject
  latestTitles: ScrapboxProjectTitles
  updatedTitles: ScrapboxProjectTitles
}

// updatedが更新されているタイトルを抽出する
function filterUpdatedTitles(
  projectWithLatestTitles: ProjectWithLatestTitles,
): ProjectWithUpdatedTitles {
  const cachedTitlesMap = new Map(projectWithLatestTitles.cachedProject.pages.map(page => [page.id, page]))
  const updatedTitles = projectWithLatestTitles.latestTitles
    .filter((latest) => {
      const cached = cachedTitlesMap.get(latest.id)

      return cached === undefined || cached.updated < latest.updated
    })
  return {
    cachedProject: projectWithLatestTitles.cachedProject,
    latestTitles: projectWithLatestTitles.latestTitles,
    updatedTitles,
  }
}

interface ProjectWithUpdatedPages {
  cachedProject: ScrapboxProject
  latestTitles: ScrapboxProjectTitles
  updatedPages: ScrapboxPage[]
}

// 更新されたタイトルの最新のScrapboxPageを取得する
function getUpdatedScrapboxPages(
  getLatestScrapboxPage: FetchScrapboxPage,
  projectWithUpdatedTitles: ProjectWithUpdatedTitles,
): ResultAsync<ProjectWithUpdatedPages, Error> {
  const updatedPages = projectWithUpdatedTitles.updatedTitles
    .map(title => getLatestScrapboxPage(
      projectWithUpdatedTitles.cachedProject.name,
      title.title,
    ))
  return ResultAsync.combine(updatedPages)
    .map(pages => ({
      cachedProject: projectWithUpdatedTitles.cachedProject,
      latestTitles: projectWithUpdatedTitles.latestTitles,
      updatedPages: pages,
    }))
}

// ScrapboxProjectのpagesを更新する
function mapToScrapboxProject(
  projectWithUpdatedPages: ProjectWithUpdatedPages,
): ScrapboxProject {
  const updatedPageMap = new Map(projectWithUpdatedPages.updatedPages.map(page => [page.id, page]))
  const cachedPageMap = new Map(projectWithUpdatedPages.cachedProject.pages.map(page => [page.id, page]))
  const updatedProject = {
    ...projectWithUpdatedPages.cachedProject,
    pages: projectWithUpdatedPages.latestTitles
      .map(title => updatedPageMap.get(title.id) || cachedPageMap.get(title.id) || null)
      .filter((page): page is ScrapboxPage => page !== null),
  }
  return updatedProject
}

// 最新のScrapboxProjectを取得し、キャッシュを更新する
export function updateScrapboxProjectCache(
  fetchScrapboxProjectTitles: FetchScrapboxProjectTitles,
  loadScrapboxProject: LoadScrapboxProject,
  fetchScrapboxPage: FetchScrapboxPage,
  saveScrapboxProject: SaveScrapboxProject,
) {
  return (projectName: string) =>
    ResultAsync.combine([
      fetchScrapboxProjectTitles(projectName),
      loadScrapboxProject(projectName),
    ])
      .map(([latestTitles, cachedProject]) => ({ latestTitles, cachedProject }))
      .map(filterUpdatedTitles)
      .andThen(projectWithUpdatedTitles => getUpdatedScrapboxPages(fetchScrapboxPage, projectWithUpdatedTitles))
      .map(mapToScrapboxProject)
      .andThen(saveScrapboxProject)
}
