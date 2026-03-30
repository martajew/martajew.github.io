import { getCollection } from 'astro:content'
import { DesignModel, PageModel, SettingsModel } from './models'

export async function getPagePaths() {
  return (await getPages())
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

export async function getPages(): Promise<PageModel[]> {
  return (await getCollection('pages'))
    .map(PageModel.fromEntry)
    .filter(page => page !== undefined)
}

export async function getDesigns(): Promise<DesignModel[]> {
  const designs = await getCollection('designs')
  const models = await Promise.all(designs.map(DesignModel.fromEntry))
  return models
    .filter(design => design !== undefined)
    .sort((a, b) => (b.entry.data.sortDate?.getTime() ?? 0) - (a.entry.data.sortDate?.getTime() ?? 0))
}

export async function getPublishedDesigns(): Promise<DesignModel[]> {
  return (await getDesigns()).filter(design => !design.entry.data.isDraft)
}

export async function getFeaturedDesigns(): Promise<DesignModel[]> {
  return (await getPublishedDesigns()).filter(design => design.entry.data.isFeatured)
}

export async function getDesignByPermalink(permalink: string | undefined): Promise<DesignModel | undefined> {
  return (await getPublishedDesigns()).find(design => design.getDetailsPermalink() === permalink)
}

export async function getSettings(): Promise<SettingsModel> {
  const settings = await getCollection('settings')
  return SettingsModel.fromEntries(settings)
}
