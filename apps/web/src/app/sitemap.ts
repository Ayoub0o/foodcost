import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";
import { loadBlogPosts, loadGuides, loadHelpArticles } from "@/lib/content/load";
import { VS_PAGES } from "@/content/vs/competitors";

const PAGES: { paths: Record<string, string>; priority: number }[] = [
  { paths: { en: "/", fr: "/" }, priority: 1 },
  { paths: { en: "/calculator", fr: "/calculateur-food-cost" }, priority: 0.9 },
  { paths: { en: "/tools/menu-cost-calculator", fr: "/outils/calculateur-cout-menu" }, priority: 0.85 },
  { paths: { en: "/tools/pour-cost-calculator", fr: "/outils/calculateur-cout-matiere-bar" }, priority: 0.85 },
  { paths: { en: "/pricing", fr: "/tarifs" }, priority: 0.7 },
  { paths: { en: "/templates", fr: "/modeles" }, priority: 0.7 },
  { paths: { en: "/blog", fr: "/blog" }, priority: 0.8 },
  { paths: { en: "/help", fr: "/aide" }, priority: 0.7 },
  { paths: { en: "/about", fr: "/a-propos" }, priority: 0.5 },
  { paths: { en: "/privacy", fr: "/confidentialite" }, priority: 0.3 },
  { paths: { en: "/terms", fr: "/conditions" }, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  function push(paths: Record<string, string>, priority: number, lastMod?: string) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      const slug = paths[locale];
      if (slug) languages[locale] = absoluteUrl(locale, slug);
    }
    for (const locale of routing.locales) {
      const slug = paths[locale];
      if (!slug) continue;
      entries.push({
        url: absoluteUrl(locale, slug),
        lastModified: lastMod ? new Date(lastMod) : now,
        changeFrequency: "weekly",
        priority,
        alternates: { languages },
      });
    }
  }

  for (const page of PAGES) push(page.paths, page.priority);

  for (const p of loadBlogPosts("en")) {
    push(
      { en: `/blog/${p.frontmatter.slug}`, fr: `/blog/${p.frontmatter.translationOf}` },
      0.75,
      p.frontmatter.updatedAt,
    );
  }
  for (const h of loadHelpArticles("en")) {
    push({ en: `/help/${h.frontmatter.slug}`, fr: `/aide/${h.frontmatter.slug}` }, 0.6, h.frontmatter.updatedAt);
  }
  for (const g of loadGuides("en")) {
    push(
      { en: `/guides/${g.frontmatter.slug}`, fr: `/guides/${g.frontmatter.translationOf}` },
      0.7,
      g.frontmatter.updatedAt,
    );
  }
  for (const v of VS_PAGES) {
    push({ en: `/vs/${v.slug}`, fr: `/vs/${v.slug}` }, 0.65, v.updatedAt);
  }

  return entries;
}
