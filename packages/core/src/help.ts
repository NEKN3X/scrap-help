import type { Helpfeel } from './scrapbox.js'

export type HelpContent = string

export interface Help {
  helpfeel: Helpfeel
  content: HelpContent
}
