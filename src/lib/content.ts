import { getCollection, type CollectionEntry } from "astro:content";
import type { PageDataByTemplate, SiteSettingsData } from "./content-types";

type PageEntry = CollectionEntry<"pages">;
type Template = PageEntry["data"]["template"];

const getPageEntryByTemplate = async <T extends Template>(
    template: T
): Promise<CollectionEntry<"pages"> & { data: PageDataByTemplate<T> }> => {
    const pages = await getCollection("pages");
    const page = pages.find((entry): entry is CollectionEntry<"pages"> & { data: PageDataByTemplate<T> } => {
        return entry.data.template === template;
    });

    if (!page) {
        throw new Error(`Missing or invalid pages entry for template: ${template}`);
    }

    return page;
};

export const getPageDataByTemplate = async <T extends Template>(template: T): Promise<PageDataByTemplate<T>> => {
    const page = await getPageEntryByTemplate(template);
    return page.data;
};

export const getSiteSettings = async (): Promise<SiteSettingsData> => {
    const settings = await getCollection("siteSettings");
    const siteSettings = settings[0];
    if (!siteSettings) {
        throw new Error("Missing site settings content entry.");
    }
    return siteSettings.data;
};

export const getPublishedDesigns = async (): Promise<CollectionEntry<"designs">[]> => {
    return getCollection("designs", ({ data }) => !data.isDraft);
};
