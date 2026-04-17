import type { Page, PaginateFunction } from 'astro'
import type { DesignModel } from './design-model'
import { PageModel } from './page-model'

export class DesignsPageModel extends PageModel {
  private constructor(page: PageModel, private readonly route: string | undefined, private readonly pagination: Page<DesignModel>) {
    super(page.entry)
  }

  static paginate(page: PageModel, paginate: PaginateFunction, designs: DesignModel[]): PageModel[] {
    const block = page.getBlockByType('section_designs_block')
    if (block) {
      const sectionDesigns = block.section ? designs.filter(d => d.entry.data.section === block.section) : designs
      return paginate(sectionDesigns, { pageSize: block.pageSize ?? 10 })
        .map(pagination => new DesignsPageModel(page, pagination.params.page, pagination.props.page))
    }
    return [page]
  }

  override getTitle(): string | undefined {
    const baseTitle = this.entry.data.title
    return this.route ? `${baseTitle} - Page ${this.pagination.currentPage}` : baseTitle
  }

  override getStaticPath(): string | undefined {
    const permalink = this.getNormalizedPermalink()
    return permalink ? `${permalink}${this.route ? `/${this.route}` : ''}` : this.route
  }

  override getItems(): DesignModel[] {
    return this.pagination.data
  }

  override getPrevUrl(): string | undefined {
    const url = this.pagination.url.prev
    if (!url)
      return undefined
    const permalink = this.getNormalizedPermalink()
    return permalink ? `/${permalink}${url}` : url
  }

  override getNextUrl(): string | undefined {
    const url = this.pagination.url.next
    if (!url)
      return undefined
    const permalink = this.getNormalizedPermalink()
    return permalink ? `/${permalink}${url}` : url
  }
}
