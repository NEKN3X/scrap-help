export * from './flow/index.js'
export * from './search.js'

export function urlToSubTitle(url: URL): string {
  const host = url.hostname.replace('scrapbox.io', '')
  return `${host}${decodeURIComponent(url.pathname)}${decodeURIComponent(url.search)}`
}
