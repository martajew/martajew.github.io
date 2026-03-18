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
    const settings = await getCollection("settings");
    const designsSettings = settings.find((entry) => entry.data.section === "designs");
    const navigationSettings = settings.find((entry) => entry.data.section === "navigation");
    const footerSettings = settings.find((entry) => entry.data.section === "footer");
    const ordersSettings = settings.find((entry) => entry.data.section === "orders");

    if (!designsSettings || !navigationSettings || !footerSettings || !ordersSettings) {
        throw new Error("Missing one or more required settings entries.");
    }

    return {
        designs: {
            paginationPageSize: designsSettings.data.paginationPageSize
        },
        navLinks: navigationSettings.data.navLinks,
        footer: {
            socialsHeading: footerSettings.data.socialsHeading,
            navigationHeading: footerSettings.data.navigationHeading,
            socials: footerSettings.data.socials,
            copyright: footerSettings.data.copyright,
            creditsPrefix: footerSettings.data.creditsPrefix,
            builtWithLabel: footerSettings.data.builtWithLabel,
            builtWithHref: footerSettings.data.builtWithHref,
            builtByLabel: footerSettings.data.builtByLabel,
            builtByHref: footerSettings.data.builtByHref
        },
        orders: {
            paymentButtonLabel: ordersSettings.data.paymentButtonLabel
        }
    };
};

export const getPublishedDesigns = async (): Promise<CollectionEntry<"designs">[]> => {
    return getCollection("designs", ({ data }) => !data.isDraft);
};
