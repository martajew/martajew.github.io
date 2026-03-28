import type { CollectionEntry, ReferenceDataEntry } from 'astro:content'
import { getCollection, getEntry } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>
export type PageReferenceEntry = ReferenceDataEntry<'pages'>
export type PageData = PageEntry['data']
export type PageBlock = PageData['blocks'][number]
export type PageBlockType = PageBlock['type']
export type PageBlocksMap = { [T in PageBlockType]: Extract<PageBlock, { type: T }> }

export type DesignEntry = CollectionEntry<'designs'> & {
  getDetailsPage: () => PageEntry
  getDetailsPermalink: () => string
}

export type SettingsEntry = CollectionEntry<'settings'>
export type SettingsData = SettingsEntry['data']
export type SettingsSection = SettingsData['section']
export type AllSettingsMap = { [S in SettingsSection]: Extract<SettingsData, { section: S }> }

const PERMALINK_HOME = 'home'
const REGEX_MULTI_SLASH = /\/+/g
const REGEX_EDGE_SLASH = /^\/|\/$/g

export async function getPagePaths() {
  // @fixme move to model/decorator
  const skipBlockTypes: PageBlockType[] = ['design_details_block']
  return (await getAllPages())
    .filter(page => !page.data.blocks.some(block => skipBlockTypes.includes(block.type)))
    .map((page) => {
      const permalink = normalizePermalink(page.data.permalink)
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

// @fixme move to model/decorator
export function sanitizePermalink(permalink: string | undefined): string | undefined {
  return permalink?.replace(REGEX_MULTI_SLASH, '/').replace(REGEX_EDGE_SLASH, '')
}

// @fixme move to model/decorator
export function normalizePermalink(permalink: string | undefined): string | undefined {
  return sanitizePermalink(permalink) === PERMALINK_HOME ? undefined : sanitizePermalink(permalink)
}

export async function getAllPages(): Promise<PageEntry[]> {
  return (await getCollection('pages'))
    .filter(page => !!sanitizePermalink(page.data.permalink))
}

export async function getPageByReference(reference: PageReferenceEntry | undefined): Promise<PageEntry | undefined> {
  return reference ? await getEntry(reference) : undefined
}

export async function getAllDesings(): Promise<DesignEntry[]> {
  const designs = await getCollection('designs')
  const mapped = await Promise.all(
    designs.map(async (design): Promise<DesignEntry | undefined> => {
      const designPermalink = sanitizePermalink(design.data.permalink)
      if (!designPermalink)
        return undefined
      const detailsPage = await getPageByReference(design.data.detailsPage)
      if (!detailsPage)
        return undefined
      if (!sanitizePermalink(detailsPage.data.permalink))
        return undefined
      const detailsPermalink = normalizePermalink(detailsPage.data.permalink)
      return {
        ...design,
        getDetailsPage: () => detailsPage,
        getDetailsPermalink: () => `${detailsPermalink ? `${detailsPermalink}/` : ''}${designPermalink}`,
      }
    }),
  )
  return mapped
    .filter(design => design !== undefined)
    .sort((a, b) => (b.data.sortDate?.getTime() ?? 0) - (a.data.sortDate?.getTime() ?? 0))
}

export async function getPublishedDesigns(): Promise<DesignEntry[]> {
  return (await getAllDesings()).filter(design => !design.data.isDraft)
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
