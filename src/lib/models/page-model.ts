import type { CollectionEntry, ReferenceDataEntry } from 'astro:content'
import { getEntry } from 'astro:content'

const REGEX_MULTI_SLASH = /\/+/g
const REGEX_EDGE_SLASH = /^\/|\/$/g

export type PageCollectionEntry = CollectionEntry<'pages'>
export type PageReferenceEntry = ReferenceDataEntry<'pages'>
export type PageData = PageCollectionEntry['data']
export type PageBlock = PageData['blocks'][number]
export type PageBlockType = PageBlock['type']
export type PageBlocksMap = { [T in PageBlockType]: Extract<PageBlock, { type: T }> }

export class PageModel {
  private constructor(public readonly entry: PageCollectionEntry) {}

  static sanitizePermalink(permalink: string | undefined): string | undefined {
    return permalink
      ?.replace(REGEX_MULTI_SLASH, '/')
      .replace(REGEX_EDGE_SLASH, '')
  }

  static fromEntry(entry: PageCollectionEntry): PageModel | undefined {
    const model = new PageModel(entry)
    return model.getSanitizedPermalink() ? model : undefined
  }

  static async fromReference(reference: PageReferenceEntry | undefined): Promise<PageModel | undefined> {
    const entry = reference ? await getEntry(reference) : undefined
    return entry ? PageModel.fromEntry(entry) : undefined
  }

  getSanitizedPermalink(): string | undefined {
    return PageModel.sanitizePermalink(this.entry.data.permalink)
  }

  getNormalizedPermalink(): string | undefined {
    const sanitizedPermalink = this.getSanitizedPermalink()
    return sanitizedPermalink === 'home' ? undefined : sanitizedPermalink
  }

  isRoutable(): boolean {
    return !this.entry.data.blocks.some(block => block.type === 'design_details_block')
  }
}
