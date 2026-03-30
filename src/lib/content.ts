import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'
import { DesignModel, PageModel } from './models'

export type SettingsCollectionEntry = CollectionEntry<'settings'>
export type SettingsEntry = SettingsCollectionEntry
export type SettingsData = SettingsEntry['data']
export type SettingsSection = SettingsData['section']
export type AllSettingsMap = { [S in SettingsSection]: Extract<SettingsData, { section: S }> }

export async function getPagePaths() {
  return (await getAllPages())
    .filter(page => page.isRoutable())
    .map((page) => {
      const permalink = page.getNormalizedPermalink()
      const title = page.entry.data.title
      return { params: { permalink }, props: { page, title } }
    })
}

export async function getDesignPaths() {
  return (await getPublishedDesigns())
    .map((design) => {
      const page = design.getDetailsPage()
      const permalink = design.getDetailsPermalink()
      const title = `${page.entry.data.title} - ${design.entry.data.title}`
      return { params: { permalink }, props: { page, title } }
    })
}

export async function getAllPages(): Promise<PageModel[]> {
  return (await getCollection('pages'))
    .map(PageModel.fromEntry)
    .filter(page => page !== undefined)
}

export async function getAllDesigns(): Promise<DesignModel[]> {
  const designs = await getCollection('designs')
  const models = await Promise.all(designs.map(DesignModel.fromEntry))
  return models
    .filter(design => design !== undefined)
    .sort((a, b) => (b.entry.data.sortDate?.getTime() ?? 0) - (a.entry.data.sortDate?.getTime() ?? 0))
}

export async function getPublishedDesigns(): Promise<DesignModel[]> {
  return (await getAllDesigns()).filter(design => !design.entry.data.isDraft)
}

export async function getFeaturedDesigns(): Promise<DesignModel[]> {
  return (await getPublishedDesigns()).filter(design => design.entry.data.isFeatured)
}

export async function getDesignByPermalink(permalink: string | undefined): Promise<DesignModel | undefined> {
  return (await getPublishedDesigns()).find(design => design.getDetailsPermalink() === permalink)
}

export async function getAllSettings(): Promise<AllSettingsMap> {
  const settings = await getCollection('settings')
  const bySection: Partial<Record<SettingsSection, SettingsData>> = {}
  for (const { data } of settings) bySection[data.section] = data
  return bySection as AllSettingsMap
}
