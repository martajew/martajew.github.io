import type { CollectionEntry, ReferenceDataEntry } from 'astro:content'
import { getCollection, getEntry } from 'astro:content'

export type PageCollectionEntry = CollectionEntry<'pages'>
export type PageEntry = PageCollectionEntry & {
  getSanitizedPermalink: () => string | undefined
  getNormalizedPermalink: () => string | undefined
  isRoutable: () => boolean
}
export type PageReferenceEntry = ReferenceDataEntry<'pages'>
export type PageData = PageEntry['data']
export type PageBlock = PageData['blocks'][number]
export type PageBlockType = PageBlock['type']
export type PageBlocksMap = { [T in PageBlockType]: Extract<PageBlock, { type: T }> }

export type DesignCollectionEntry = CollectionEntry<'designs'>
export type DesignEntry = DesignCollectionEntry & {
  getDetailsPage: () => PageEntry
  getDetailsPermalink: () => string
}

export type SettingsCollectionEntry = CollectionEntry<'settings'>
export type SettingsEntry = SettingsCollectionEntry
export type SettingsData = SettingsEntry['data']
export type SettingsSection = SettingsData['section']
export type AllSettingsMap = { [S in SettingsSection]: Extract<SettingsData, { section: S }> }

const PERMALINK_HOME = 'home'
const REGEX_MULTI_SLASH = /\/+/g
const REGEX_EDGE_SLASH = /^\/|\/$/g

export async function getPagePaths() {
  return (await getAllPages())
    .filter(page => page.isRoutable())
    .map((page) => {
      const permalink = page.getNormalizedPermalink()
      const title = page.data.title
      return { params: { permalink }, props: { page, title } }
    })
}

export async function getDesignPaths() {
  return (await getPublishedDesigns())
    .map((design) => {
      const page = design.getDetailsPage()
      const permalink = design.getDetailsPermalink()
      const title = `${page.data.title} - ${design.data.title}`
      return { params: { permalink }, props: { page, title } }
    })
}

function sanitizePermalink(permalink: string | undefined): string | undefined {
  return permalink?.replace(REGEX_MULTI_SLASH, '/').replace(REGEX_EDGE_SLASH, '')
}

function normalizePermalink(permalink: string | undefined): string | undefined {
  return sanitizePermalink(permalink) === PERMALINK_HOME ? undefined : sanitizePermalink(permalink)
}

function decoratePage(page: PageCollectionEntry): PageEntry {
  const nonRoutableBlocks: PageBlockType[] = ['design_details_block']
  return {
    ...page,
    getSanitizedPermalink: () => sanitizePermalink(page.data.permalink),
    getNormalizedPermalink: () => normalizePermalink(page.data.permalink),
    isRoutable: () => !page.data.blocks.some(block => nonRoutableBlocks.includes(block.type)),
  }
}

export async function getAllPages(): Promise<PageEntry[]> {
  return (await getCollection('pages'))
    .map(decoratePage)
    .filter(page => !!page.getSanitizedPermalink())
}

export async function getPageByReference(reference: PageReferenceEntry | undefined): Promise<PageEntry | undefined> {
  const page = reference ? await getEntry(reference) : undefined
  return page ? decoratePage(page) : undefined
}

async function decorateDesign(design: DesignCollectionEntry): Promise<DesignEntry | undefined> {
  const designPermalink = sanitizePermalink(design.data.permalink)
  if (!designPermalink)
    return undefined
  const detailsPage = await getPageByReference(design.data.detailsPage)
  if (!detailsPage)
    return undefined
  if (!detailsPage.getSanitizedPermalink())
    return undefined
  const detailsPermalink = detailsPage.getNormalizedPermalink()
  return {
    ...design,
    getDetailsPage: () => detailsPage,
    getDetailsPermalink: () => `${detailsPermalink ? `${detailsPermalink}/` : ''}${designPermalink}`,
  }
}

export async function getAllDesigns(): Promise<DesignEntry[]> {
  const designs = await getCollection('designs')
  const decorated = await Promise.all(designs.map(decorateDesign))
  return decorated
    .filter(design => design !== undefined)
    .sort((a, b) => (b.data.sortDate?.getTime() ?? 0) - (a.data.sortDate?.getTime() ?? 0))
}

export async function getPublishedDesigns(): Promise<DesignEntry[]> {
  return (await getAllDesigns()).filter(design => !design.data.isDraft)
}

export async function getFeaturedDesigns(): Promise<DesignEntry[]> {
  return (await getPublishedDesigns()).filter(design => design.data.isFeatured)
}

export async function getDesignByPermalink(permalink: string | undefined): Promise<DesignEntry | undefined> {
  return (await getPublishedDesigns()).find(design => design.getDetailsPermalink() === permalink)
}

export async function getAllSettings(): Promise<AllSettingsMap> {
  const settings = await getCollection('settings')
  const bySection: Partial<Record<SettingsSection, SettingsData>> = {}
  for (const { data } of settings) bySection[data.section] = data
  return bySection as AllSettingsMap
}
