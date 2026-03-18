import type { CollectionEntry } from "astro:content";

type PageData = CollectionEntry<"pages">["data"];
type Template = PageData["template"];

export type PageDataByTemplate<T extends Template> = Extract<PageData, { template: T }>;

export type HomePageData = PageDataByTemplate<"home">;
export type AboutPageData = PageDataByTemplate<"about">;
export type ContactPageData = PageDataByTemplate<"contact">;
export type NotFoundPageData = PageDataByTemplate<"not-found">;
export type SitePageData = PageDataByTemplate<"site">;

export type HeroContent = HomePageData["hero"];
export type SelectedDesignsContent = HomePageData["selectedDesigns"];
export type ServicesContent = HomePageData["services"];
export type HomeAboutContent = HomePageData["aboutSection"];
export type FaqContent = HomePageData["faq"];

export type AboutIntroContent = AboutPageData["intro"];
export type ExperienceContent = AboutPageData["experience"];
export type EducationContent = AboutPageData["education"];

export type ContactIntroContent = ContactPageData["intro"];
export type ContactDetailsItem = ContactPageData["contactDetails"]["items"][number];
