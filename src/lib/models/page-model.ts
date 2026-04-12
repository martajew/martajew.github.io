import type { CollectionEntry, ReferenceDataEntry } from 'astro:content'
import { getEntry } from 'astro:content'

const REGEX_MULTI_SLASH = /\/+/g
const REGEX_EDGE_SLASH = /^\/|\/$/g
const NON_ROUTABLE_BLOCKS: PageBlockType[] = ['design_details_block']

export type PageCollectionEntry = CollectionEntry<'pages'>
export type PageReferenceEntry = ReferenceDataEntry<'pages'>
export type PageData = PageCollectionEntry['data']
export type PageBlock = PageData['blocks'][number]
export type PageBlockType = PageBlock['type']
export type PageBlockOfType<T extends PageBlockType> = Extract<PageBlock, { type: T }>
export type PageBlocksMap = { [T in PageBlockType]: Omit<PageBlockOfType<T>, 'type'> }

export class PageModel {
  protected constructor(public readonly entry: PageCollectionEntry) {}

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
    return this.getSanitizedPermalink() === 'home' ? undefined : this.getSanitizedPermalink()
  }

  getTitle(): string | undefined {
    return this.entry.data.title
  }

  getStaticPath(): string | undefined {
    return this.getNormalizedPermalink()
  }

  getPrevUrl(): string | undefined {
    return undefined
  }

  getNextUrl(): string | undefined {
    return undefined
  }

  getItem(): unknown {
    return undefined
  }

  getItems(): unknown[] {
    return []
  }

  isRoutable(): boolean {
    return !this.getBlocks().some(block => NON_ROUTABLE_BLOCKS.includes(block.type))
  }

  getBlocks(): PageBlock[] {
    return this.entry.data.blocks
  }

  getBlockByType<T extends PageBlockType>(type: T): PageBlockOfType<T> | undefined {
    return this.getBlocks().find((block): block is PageBlockOfType<T> => block.type === type)
  }
}
