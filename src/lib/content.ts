import type { GetStaticPaths, PaginateFunction } from 'astro'
import { getCollection } from 'astro:content'
import { DesignModel, DesignPageModel, DesignsPageModel, PageModel, SettingsModel } from './models'

export const getStaticPaths = (async ({ paginate }) => {
  const pages = await getPages()
  const designs = await getDesigns()
  const standalonePages = pages.filter(page => page.canRenderStandalone())
  const publishedDesigns = designs.filter(design => !design.entry.data.isDraft)
  return [
    ...getPagePaths(paginate, standalonePages, publishedDesigns),
    ...getDesignPaths(publishedDesigns),
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

async function getDesigns(): Promise<DesignModel[]> {
  const entries = await getCollection('designs')
  const designs = await Promise.all(entries.map(DesignModel.fromEntry))
  return designs
    .filter(design => design !== undefined)
    .sort((a, b) => (b.entry.data.sortDate?.getTime() ?? 0) - (a.entry.data.sortDate?.getTime() ?? 0))
}

export async function getSettings(): Promise<SettingsModel> {
  const settings = await getCollection('settings')
  return SettingsModel.fromEntries(settings)
}
