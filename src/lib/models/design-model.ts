import type { CollectionEntry } from 'astro:content'
import { PageModel } from './page-model'

export type DesignCollectionEntry = CollectionEntry<'designs'>

export class DesignModel {
  private constructor(public readonly entry: DesignCollectionEntry, private readonly detailsPage: PageModel) {}

  static async fromEntry(entry: DesignCollectionEntry): Promise<DesignModel | undefined> {
    if (!PageModel.sanitizePermalink(entry.data.permalink))
      return undefined

    const detailsPage = await PageModel.fromReference(entry.data.detailsPage)
    if (!detailsPage)
      return undefined

    return new DesignModel(entry, detailsPage)
  }

  getDetailsPage(): PageModel {
    return this.detailsPage
  }

  getStaticPath(): string {
    const detailsPermalink = this.detailsPage.getNormalizedPermalink()
    const designPermalink = PageModel.sanitizePermalink(this.entry.data.permalink)
    return `${detailsPermalink ? `${detailsPermalink}/` : ''}${designPermalink}`
  }
}
