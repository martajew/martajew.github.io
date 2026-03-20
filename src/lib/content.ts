import {type CollectionEntry, getCollection} from "astro:content";
import type {PageDataByTemplate, SiteSettingsData} from "./content-types";

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
    const settings = await getCollection("settings");
    const layoutSettings = settings.find((entry) => entry.data.section === "layout");
    const navigationSettings = settings.find((entry) => entry.data.section === "navigation");
    const designsSettings = settings.find((entry) => entry.data.section === "designs");

    if (!designsSettings || !layoutSettings || !navigationSettings) {
        throw new Error("Missing one or more required settings entries.");
    }

    return {
        layout: {
          mainPageTitle: layoutSettings.data.mainPageTitle,
          socialsHeading: layoutSettings.data.socialsHeading,
          navigationHeading: layoutSettings.data.navigationHeading,
          socials: layoutSettings.data.socials,
          copyright: layoutSettings.data.copyright,
          creditsPrefix: layoutSettings.data.creditsPrefix,
          builtWithLabel: layoutSettings.data.builtWithLabel,
          builtWithHref: layoutSettings.data.builtWithHref,
          builtByLabel: layoutSettings.data.builtByLabel,
          builtByHref: layoutSettings.data.builtByHref,
        },
        navLinks: navigationSettings.data.navLinks,
        designs: {
            paginationPageSize: designsSettings.data.paginationPageSize,
            paymentButtonLabel: designsSettings.data.paymentButtonLabel
        },
    };
};

export const getPublishedDesigns = async (): Promise<CollectionEntry<"designs">[]> => {
    const publishedDesigns = await getCollection("designs", ({ data }) => !data.isDraft);
    return publishedDesigns.sort((left, right) => {
      return right.data.sortDate.getTime() - left.data.sortDate.getTime();
    });
};
