import {getCollection} from "astro:content";
import type {DesignEntry, PageBlockType, PageEntry, SiteSettingsMap} from "./content-types";
import type {GetStaticPaths} from "astro";

export const getPagePaths = (async () => {
  const pages = await getAllPages();
  const skipBlocksTypes: PageBlockType[] = ["design_details_block"];
  return pages
    .filter((page) => !page.data.blocks.some((block) => skipBlocksTypes.includes(block.type)))
    .map((page) => {
      const slug = sanitizeSlug(page.data.slug);
      const title = page.data.title;
      return {params: {slug}, props: {page, title}};
    });
}) satisfies GetStaticPaths;

export const getDesignPaths = (async () => {
  const pages = await getAllPages();
  const designs = await getPublishedDesigns();
  return designs.map((design) => {
    const page = getPageByFileId(pages, design.data.detailsPage.id);
    const slug = `${sanitizeSlug(page.data.slug)}/${sanitizeSlug(design.data.slug)}`;
    const title = `${page.data.title} - ${design.data.title}`;
    return {params: {slug}, props: {page, title}};
  });
}) satisfies GetStaticPaths;

export const sanitizeSlug = (slug: string): string | undefined => {
  const saneSlug = slug.replace(/\/+/g, "/").replace(/^\/|\/$/g, '');
  return saneSlug === "home" ? undefined : saneSlug;
};

export const getAllPages = async (): Promise<PageEntry[]> => {
  return await getCollection("pages");
};

export const getPageByFileId = (pages: PageEntry[], fileId: string): PageEntry => {
  const page = pages.find((page) => page.filePath?.endsWith(`${page.collection}/${fileId}.md`));
  if (!page) throw new Error(`Missing or invalid pages entry for file ID: ${fileId}`);
  return page;
};

export const getAllDesings = async (): Promise<DesignEntry[]> => {
  return await getCollection("designs");
};

export const getPublishedDesigns = async (): Promise<DesignEntry[]> => {
  const designs = await getAllDesings();
  const publishedDesigns = designs.filter((design) => !design.data.isDraft);
  return publishedDesigns.sort((left, right) => {
    return right.data.sortDate.getTime() - left.data.sortDate.getTime();
  });
};

export const getFeaturedDesigns = async (): Promise<DesignEntry[]> => {
  const publishedDesigns = await getPublishedDesigns();
  return publishedDesigns.filter((design) => design.data.isFeatured);
};

export const getDesignBySlug = async (slug: string | undefined): Promise<DesignEntry> => {
  const pages = await getAllPages();
  const publishedDesigns = await getPublishedDesigns();
  const design = publishedDesigns.find((design) => {
    const page = getPageByFileId(pages, design.data.detailsPage.id);
    return `${sanitizeSlug(page.data.slug)}/${sanitizeSlug(design.data.slug)}` === slug;
  });
  if (!design) throw new Error(`Missing or invalid design entry for slug: ${slug}`);
  return design;
};


export const getSiteSettings = async (): Promise<SiteSettingsMap> => {
  const settings = await getCollection("settings");
  const layoutSettings = settings.find((settings) => settings.data.section === "layout");
  const navigationSettings = settings.find((settings) => settings.data.section === "navigation");
  const designsSettings = settings.find((settings) => settings.data.section === "designs");

  if (!designsSettings || !layoutSettings || !navigationSettings) throw new Error("Missing one or more required settings entries.");

  return {
    layout: layoutSettings.data as SiteSettingsMap["layout"],
    navigation: navigationSettings.data as SiteSettingsMap["navigation"],
    designs: designsSettings.data as SiteSettingsMap["designs"]
  }
};
