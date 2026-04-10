import type { Params as AstroParams, Props as AstroProps, GetStaticPaths, Page, PaginateFunction } from 'astro'
import { getCollection } from 'astro:content'
import { DesignModel, PageModel, SettingsModel } from './models'

export interface PageContext extends AstroProps {
  page: PageModel
  title: string | undefined
  design?: DesignModel
  designs?: Page<DesignModel>
}

interface StaticPath {
  params: { page: string | undefined } & AstroParams
  props: PageContext
}

export const getStaticPaths = (async ({ paginate }) => {
  const pages = await getRoutablePages()
  const designs = await getPublishedDesigns()
  return [
    ...getPagePaths(paginate, pages, designs),
    ...getDesignPaths(designs),
  ]
}) satisfies GetStaticPaths

function getPagePaths(paginate: PaginateFunction, pages: PageModel[], designs: DesignModel[]): StaticPath[] {
  return pages.flatMap(page => mapPagePaths(page, paginate, designs))
}

function mapPagePaths(page: PageModel, paginate: PaginateFunction, designs: DesignModel[]): StaticPath[] {
  const allDesignsBlock = page.getBlockByType('all_designs_block')
  if (allDesignsBlock) {
    const pageSize = allDesignsBlock.pageSize ?? 3
    const paths = paginate(designs, { pageSize })
    return paths.map(path => mapDesignsPage(page, path.params.page, path.props.page))
  }
  else {
    const permalink = page.getNormalizedPermalink()
    const title = page.entry.data.title
    return [{ params: { page: permalink }, props: { page, title } }]
  }
}

function mapDesignsPage(page: PageModel, slug: string | undefined, designs: Page<DesignModel>): StaticPath {
  const permalink = page.getNormalizedPermalink()
  const title = page.entry.data.title
  const pathPermalink = permalink ? `${permalink}${slug ? `/${slug}` : ''}` : slug // handle home page
  const pathTitle = `${title}${slug ? ` - Page ${designs.currentPage}` : ''}`
  return { params: { page: pathPermalink }, props: { page, title: pathTitle, designs } }
}

function getDesignPaths(designs: DesignModel[]): StaticPath[] {
  return designs
    .map((design) => {
      const page = design.getDetailsPage()
      const permalink = design.getDetailsPermalink()
      const title = `${page.entry.data.title} - ${design.entry.data.title}`
      return { params: { page: permalink }, props: { page, title, design } }
    })
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

export async function getSettings(): Promise<SettingsModel> {
  const settings = await getCollection('settings')
  return SettingsModel.fromEntries(settings)
}
