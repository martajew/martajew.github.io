import type { DesignModel } from './design-model'
import { PageModel } from './page-model'

export class DesignPageModel extends PageModel {
  private constructor(private readonly design: DesignModel) {
    super(design.getDetailsPage().entry)
  }

  static fromDesign(design: DesignModel): DesignPageModel {
    return new DesignPageModel(design)
  }

  override getTitle(): string | undefined {
    return `${this.entry.data.title} - ${this.design.entry.data.title}`
  }

  override getStaticPath(): string | undefined {
    return this.design.getStaticPath()
  }

  override getItem(): DesignModel {
    return this.design
  }
}
