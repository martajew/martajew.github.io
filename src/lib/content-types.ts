import type { CollectionEntry } from "astro:content";

type PageData = CollectionEntry<"pages">["data"];
type SettingsData = CollectionEntry<"settings">["data"];
type SettingsSection = SettingsData["section"];

export type SettingsDataBySection<S extends SettingsSection> = Extract<SettingsData, { section: S }>;
export type SiteSettingsData = {
    layout: Omit<SettingsDataBySection<"layout">, "section">;
    navLinks: SettingsDataBySection<"navigation">["navLinks"];
    designs: Omit<SettingsDataBySection<"designs">, "section">;
};

export type ComposablePageData = PageData;
export type PageBlock = ComposablePageData["blocks"][number];

export type HeadingBlock = Extract<PageBlock, { type: "heading_block" }>;
export type IntroBlock = Extract<PageBlock, { type: "intro_block" }>;
export type HeroBlock = Extract<PageBlock, { type: "hero_block" }>;
export type CalloutBlock = Extract<PageBlock, { type: "callout_block" }>;
export type AccordionBlock = Extract<PageBlock, { type: "accordion_block" }>;
export type NumberedAccordionBlock = Extract<PageBlock, { type: "numbered_accordion_block" }>;
export type ContactsBlock = Extract<PageBlock, { type: "contacts_block" }>;
