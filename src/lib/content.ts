import type { GetStaticPaths, PaginateFunction } from 'astro'
import { getCollection } from 'astro:content'
import { DesignModel, DesignPageModel, DesignsPageModel, PageModel, SettingsModel } from './models'

export const getStaticPaths = (async ({ paginate }) => {
  const standalonePages = (await getPages()).filter(page => page.canRenderStandalone())
  const publishedDesigns = (await getDesigns()).filter(design => !design.entry.data.isDraft)
  const routablePages = [
    ...standalonePages,
    ...publishedDesigns.map(design => DesignPageModel.fromDesign(design)),
  ]
  return getPagePaths(paginate, routablePages, publishedDesigns)
}) satisfies GetStaticPaths

function getPagePaths(paginate: PaginateFunction, pages: PageModel[], designs: DesignModel[]) {
  return pages
    .flatMap(page => DesignsPageModel.paginate(page, paginate, designs))
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
