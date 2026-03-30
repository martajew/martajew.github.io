import type { CollectionEntry } from 'astro:content'

export type SettingsCollectionEntry = CollectionEntry<'settings'>
export type SettingsData = SettingsCollectionEntry['data']
export type SettingsSection = SettingsData['section']
export type SettingsMap = { [S in SettingsSection]: Extract<SettingsData, { section: S }> }

export class SettingsModel {
  private constructor(private readonly sections: SettingsMap) {}

  static fromEntries(entries: SettingsCollectionEntry[]): SettingsModel {
    const sections: Partial<Record<SettingsSection, SettingsData>> = {}
    for (const { data } of entries) sections[data.section] = data
    return new SettingsModel(sections as SettingsMap)
  }

  get layout(): SettingsMap['layout'] {
    return this.sections.layout
  }

  get navigation(): SettingsMap['navigation'] {
    return this.sections.navigation
  }

  get designs(): SettingsMap['designs'] {
    return this.sections.designs
  }
}
