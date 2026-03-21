import {getCollection} from "astro:content";
import type {DesignEntry, PageEntry, SiteSettingsMap} from "./content-types";

export const sanitizeSlug = (slug: string): string | undefined => {
  const saneSlug = slug.replace(/\/+/g, "/").replace(/^\/|\/$/g, '');
  return saneSlug === "home" ? undefined : saneSlug;
};

export const getAllPages = async (): Promise<PageEntry[]> => {
  return await getCollection("pages");
};

export const getPageBySlug = async (slug: string): Promise<PageEntry> => {
  const pages = await getAllPages();
  const saneSlug = sanitizeSlug(slug);
  const page = pages.find((entry) => sanitizeSlug(entry.data.slug) === saneSlug);

  if (!page) throw new Error(`Missing or invalid pages entry for slug: ${slug} (${saneSlug})`);

  return page;
};

export const getAllDesings = async (): Promise<DesignEntry[]> => {
  return await getCollection("designs");
};

export const getPublishedDesigns = async (): Promise<DesignEntry[]> => {
  const designs = await getAllDesings();
  const publishedDesigns = designs.filter((entry) => !entry.data.isDraft);
  return publishedDesigns.sort((left, right) => {
    return right.data.sortDate.getTime() - left.data.sortDate.getTime();
  });
};

export const getFeaturedDesigns = async (): Promise<DesignEntry[]> => {
  const publishedDesigns = await getPublishedDesigns();
  return publishedDesigns.filter((entry) => entry.data.isFeatured);
};

export const getSiteSettings = async (): Promise<SiteSettingsMap> => {
  const settings = await getCollection("settings");
  const layoutSettings = settings.find((entry) => entry.data.section === "layout");
  const navigationSettings = settings.find((entry) => entry.data.section === "navigation");
  const designsSettings = settings.find((entry) => entry.data.section === "designs");

  if (!designsSettings || !layoutSettings || !navigationSettings) throw new Error("Missing one or more required settings entries.");

  return {
    layout: layoutSettings.data as SiteSettingsMap["layout"],
    navigation: navigationSettings.data as SiteSettingsMap["navigation"],
    designs: designsSettings.data as SiteSettingsMap["designs"]
  }
};
