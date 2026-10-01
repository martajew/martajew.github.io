import type { Page, PaginateFunction } from 'astro'
import type { DesignModel } from './design-model'
import { PageModel } from './page-model'

export class DesignsPageModel extends PageModel {
  private constructor(private readonly page: PageModel, private readonly route: string | undefined, private readonly pagination: Page<DesignModel>) {
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
    const baseTitle = this.page.getTitle()
    return this.route ? `${baseTitle} - Page ${this.pagination.currentPage}` : baseTitle
  }

  override getStaticPath(): string | undefined {
    const path = this.page.getStaticPath()
    return path ? `${path}${this.route ? `/${this.route}` : ''}` : this.route
  }

  override getItem(): unknown {
    return this.page.getItem()
  }

  override getItems(): DesignModel[] {
    return this.pagination.data
  }

  override getPrevUrl(): string | undefined {
    return this.getPaginationUrl(this.pagination.url.prev)
  }

  override getNextUrl(): string | undefined {
    return this.getPaginationUrl(this.pagination.url.next)
  }

  private getPaginationUrl(url: string | undefined): string | undefined {
    if (!url)
      return undefined
    const path = this.page.getStaticPath()
    return path ? `/${path}${url}` : url
  }
}
