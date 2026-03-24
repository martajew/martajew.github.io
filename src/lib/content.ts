import type { GetStaticPaths } from 'astro'
import type { DesignEntry, PageBlockType, PageEntry, SiteSettingsMap } from './content-types'
import { getCollection } from 'astro:content'

const MULTI_SLASH_REGEX = /\/+/g
const EDGE_SLASH_REGEX = /^\/|\/$/g

export const getPagePaths = (async () => {
  const pages = await getAllPages()
  const skipBlocksTypes: PageBlockType[] = ['design_details_block']
  return pages
    .filter(page => !page.data.blocks.some(block => skipBlocksTypes.includes(block.type)))
    .map((page) => {
      const permalink = sanitizePermalink(page.data.permalink)
      const title = page.data.title
      return { params: { permalink }, props: { page, title } }
    })
}) satisfies GetStaticPaths

export const getDesignPaths = (async () => {
  const pages = await getAllPages()
  const designs = await getPublishedDesigns()
  return designs.map((design) => {
    const page = getPageByFileId(pages, design.data.detailsPage?.id)
    const permalink = `${sanitizePermalink(page.data.permalink)}/${sanitizePermalink(design.data.permalink)}`
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
  return await getCollection('designs')
}

export async function getPublishedDesigns(): Promise<DesignEntry[]> {
  const designs = await getAllDesings()
  return designs.filter(design => !design.data.isDraft)
    .sort((a, b) => (b.data.sortDate?.getTime() ?? 0) - (a.data.sortDate?.getTime() ?? 0))
}

export async function getFeaturedDesigns(): Promise<DesignEntry[]> {
  const publishedDesigns = await getPublishedDesigns()
  return publishedDesigns.filter(design => design.data.isFeatured)
}

export async function getDesignByPermalink(permalink: string | undefined): Promise<DesignEntry> {
  const pages = await getAllPages()
  const publishedDesigns = await getPublishedDesigns()
  const design = publishedDesigns.find((design) => {
    const page = getPageByFileId(pages, design.data.detailsPage?.id)
    return `${sanitizePermalink(page.data.permalink)}/${sanitizePermalink(design.data.permalink)}` === permalink
  })
  if (!design)
    throw new Error(`Missing or invalid design entry for permalink: ${permalink}`)
  return design
}

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const settings = await getCollection('settings')
  const layoutSettings = settings.find(settings => settings.data.section === 'layout')
  const navigationSettings = settings.find(settings => settings.data.section === 'navigation')
  const designsSettings = settings.find(settings => settings.data.section === 'designs')

  if (!designsSettings || !layoutSettings || !navigationSettings)
    throw new Error('Missing one or more required settings entries.')

  return {
    layout: layoutSettings.data as SiteSettingsMap['layout'],
    navigation: navigationSettings.data as SiteSettingsMap['navigation'],
    designs: designsSettings.data as SiteSettingsMap['designs'],
  }
}
