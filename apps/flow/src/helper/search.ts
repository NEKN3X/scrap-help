import type { FzfResultItem } from 'fzf'
import { Fzf } from 'fzf'

export function search<T>(
  data: T[],
  query: string,
  selector: (item: T) => string,
): T[] {
  const segmenter = new Intl.Segmenter(['ja-JP', `en-US`], {
    granularity: 'word',
  })
  const segmentText = (text: string) =>
    [...segmenter.segment(text)]
      .filter(segment => segment.isWordLike)
      .map(x => x.segment)
      .join(' ')
  const splitAlphaNum = (str: string) => {
    const parts = str.match(/\D+|\d+/g)
    return parts ? parts.join(' ') : ''
  }
  const segmented = data.map(x => ({
    ...x,
    segmented: splitAlphaNum(segmentText(selector(x))).toLowerCase(),
  }))

  const fzf = new Fzf(segmented, {
    selector: (x: T & { segmented: string }) => x.segmented,
  })

  const segmentedQuery = splitAlphaNum(segmentText(query)).toLowerCase()
  const result: FzfResultItem[] = fzf.find(segmentedQuery)

  return result.map(item => item.item as T)
}
