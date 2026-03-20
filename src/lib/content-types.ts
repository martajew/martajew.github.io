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

type BlockWithImage = Extract<PageBlock, { image: unknown }>;
type PageImage = BlockWithImage["image"];

export type HeroContent = {
    introText: string;
    ctaLabel: string;
    ctaHref: string;
    name: string;
    image: PageImage;
    imageAlt: string;
};

export type SelectedDesignsContent = {
    heading: string;
    buttonLabel: string;
    buttonHref: string;
};

export type ServicesContent = {
    heading: string;
    items: {
        title: string;
        text: string;
    }[];
};

export type HomeAboutContent = {
    heading: string;
    lead: string;
    bodyOne: string;
    bodyTwo: string;
    buttonLabel: string;
    buttonHref: string;
    image: PageImage;
    imageAlt: string;
};

export type FaqContent = {
    heading: string;
    items: {
        title: string;
        text: string;
    }[];
};

export type AboutIntroContent = {
    heading: string;
    lead: string;
    body: string;
    image: PageImage;
    imageAlt: string;
};

export type ExperienceContent = {
    heading: string;
    items: {
        title: string;
        place: string;
        period: string;
        text: string;
    }[];
};

export type EducationContent = ExperienceContent;

export type ContactIntroContent = {
    heading: string;
    lead: string;
    bodyOne: string;
    bodyTwo: string;
};

export type ContactDetailsItem = ContactsBlock["items"][number];
