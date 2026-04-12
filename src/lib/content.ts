import type { GetStaticPaths, PaginateFunction } from 'astro'
import { getCollection } from 'astro:content'
import { DesignModel, DesignPageModel, DesignsPageModel, PageModel, SettingsModel } from './models'

export const getStaticPaths = (async ({ paginate }) => {
  const pages = await getRoutablePages()
  const designs = await getPublishedDesigns()
  return [
    ...getPagePaths(paginate, pages, designs),
    ...getDesignPaths(designs),
  ]
}) satisfies GetStaticPaths

function getPagePaths(paginate: PaginateFunction, pages: PageModel[], designs: DesignModel[]) {
  return pages
    .flatMap(page => DesignsPageModel.paginate(page, paginate, designs))
    .map(toStaticPath)
}

function getDesignPaths(designs: DesignModel[]) {
  return designs
    .map(design => DesignPageModel.fromDesign(design))
    .map(toStaticPath)
}

function toStaticPath(page: PageModel) {
  return { params: { page: page.getStaticPath() }, props: { page } }
}

async function getPages(): Promise<PageModel[]> {
  return (await getCollection('pages'))
    .map(PageModel.fromEntry)
    .filter(page => page !== undefined)
}

async function getRoutablePages(): Promise<PageModel[]> {
  return (await getPages()).filter(page => page.isRoutable())
}

async function getDesigns(): Promise<DesignModel[]> {
  const entries = await getCollection('designs')
  const designs = await Promise.all(entries.map(DesignModel.fromEntry))
  return designs
    .filter(design => design !== undefined)
    .sort((a, b) => (b.entry.data.sortDate?.getTime() ?? 0) - (a.entry.data.sortDate?.getTime() ?? 0))
}

export async function getPublishedDesigns(): Promise<DesignModel[]> {
  return (await getDesigns()).filter(design => !design.entry.data.isDraft)
}

export async function getFeaturedDesigns(): Promise<DesignModel[]> {
  return (await getPublishedDesigns()).filter(design => design.entry.data.isFeatured)
}

export async function getSettings(): Promise<SettingsModel> {
  const settings = await getCollection('settings')
  return SettingsModel.fromEntries(settings)
}
