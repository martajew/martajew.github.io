import type { GetStaticPaths } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>
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

const MULTI_SLASH_REGEX = /\/+/g
const EDGE_SLASH_REGEX = /^\/|\/$/g

export const getPagePaths = (async () => {
  const skipBlockTypes: PageBlockType[] = ['design_details_block']
  return (await getAllPages())
    .filter(page => !page.data.blocks.some(block => skipBlockTypes.includes(block.type)))
    .map((page) => {
      const permalink = sanitizePermalink(page.data.permalink)
      const title = page.data.title
      return { params: { permalink }, props: { page, title } }
    })
}) satisfies GetStaticPaths

export const getDesignPaths = (async () => {
  return (await getPublishedDesigns()).map((design) => {
    const page = design.getDetailsPage()
    const permalink = design.getDetailsPermalink()
    const title = `${page.data.title} - ${design.data.title}`
    return { params: { permalink }, props: { page, title } }
  })
}) satisfies GetStaticPaths

export function sanitizePermalink(permalink: string | undefined): string | undefined {
  const sane = permalink?.replace(MULTI_SLASH_REGEX, '/').replace(EDGE_SLASH_REGEX, '')
  return sane === 'home' ? undefined : sane
}

export async function getAllPages(): Promise<PageEntry[]> {
  return await getCollection('pages')
}

export function getPageByFileId(pages: PageEntry[], fileId: string | undefined): PageEntry {
  const page = pages.find(page => page.filePath?.endsWith(`${page.collection}/${fileId}.md`))
  if (!page)
    throw new Error(`Missing or invalid pages entry for file ID: ${fileId}`)
  return page
}

export async function getAllDesings(): Promise<DesignEntry[]> {
  const pages = await getAllPages()
  return (await getCollection('designs'))
    .map((design) => {
      const detailsPage = getPageByFileId(pages, design.data.detailsPage?.id)
      return {
        ...design,
        getDetailsPage: () => detailsPage,
        getDetailsPermalink: () => `${sanitizePermalink(detailsPage.data.permalink)}/${sanitizePermalink(design.data.permalink)}`,
      }
    })
}

export async function getPublishedDesigns(): Promise<DesignEntry[]> {
  return (await getAllDesings()).filter(design => !design.data.isDraft).sort((a, b) => (b.data.sortDate?.getTime() ?? 0) - (a.data.sortDate?.getTime() ?? 0))
}

export async function getFeaturedDesigns(): Promise<DesignEntry[]> {
  return (await getPublishedDesigns()).filter(design => design.data.isFeatured)
}

export async function getDesignByPermalink(permalink: string | undefined): Promise<DesignEntry> {
  const design = (await getPublishedDesigns()).find(design => design.getDetailsPermalink() === permalink)
  if (!design)
    throw new Error(`Missing or invalid published design entry for permalink: ${permalink}`)
  return design
}

// @fixme use discriminator instead, or getEntry
export async function getAllSettings(): Promise<AllSettingsMap> {
  const settings = await getCollection('settings')
  const layoutSettings = settings.find(settings => settings.data.section === 'layout')
  const navigationSettings = settings.find(settings => settings.data.section === 'navigation')
  const designsSettings = settings.find(settings => settings.data.section === 'designs')

  if (!designsSettings || !layoutSettings || !navigationSettings)
    throw new Error('Missing one or more required settings entries.')

  return {
    layout: layoutSettings.data as AllSettingsMap['layout'],
    navigation: navigationSettings.data as AllSettingsMap['navigation'],
    designs: designsSettings.data as AllSettingsMap['designs'],
  }
}
