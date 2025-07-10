export * from './flow/index.js'
export * from './search.js'

export function urlToSubTitle(url: URL): string {
  const host = url.hostname.replace('scrapbox.io', '')
  return `${host}${decodeURIComponent(url.pathname)}${decodeURIComponent(url.search)}`
}

export function scrapboxUrl(project: string, title: string) {
  return new URL(`https://scrapbox.io/${project}/${title}`)
}

export function scrapboxLink(project: string, title: string): string {
  return `[${title} ${scrapboxUrl(project, title).toString()}]`
}
