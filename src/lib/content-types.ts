import type { CollectionEntry } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>
export type PageData = PageEntry['data']
export type PageBlock = PageData['blocks'][number]
export type PageBlockType = PageBlock['type']
export type PageBlocksMap = { [T in PageBlockType]: Extract<PageBlock, { type: T }> }

export type DesignEntry = CollectionEntry<'designs'>
export type DesignData = DesignEntry['data']

export type SettingsEntry = CollectionEntry<'settings'>
export type SettingsData = SettingsEntry['data']
export type SettingsSection = SettingsData['section']
export type SiteSettingsMap = { [S in SettingsSection]: Extract<SettingsData, { section: S }> }
