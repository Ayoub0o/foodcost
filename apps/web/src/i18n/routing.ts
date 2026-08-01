import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Locale is always present in the path: /foodcost/en/... and /foodcost/fr/...
  localePrefix: "always",
  // Localized pathnames — FR slugs are SEO-critical (PRD §9). Each key is the
  // canonical route used in code; next-intl rewrites the per-locale slug.
  pathnames: {
    "/": "/",
    "/calculator": {
      en: "/calculator",
      fr: "/calculateur-food-cost",
    },
    "/pricing": {
      en: "/pricing",
      fr: "/tarifs",
    },
    "/templates": {
      en: "/templates",
      fr: "/modeles",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/help": {
      en: "/help",
      fr: "/aide",
    },
    "/help/[slug]": {
      en: "/help/[slug]",
      fr: "/aide/[slug]",
    },
    "/help/contact": {
      en: "/help/contact",
      fr: "/aide/contact",
    },
    "/vs/[slug]": "/vs/[slug]",
    "/tools/menu-cost-calculator": {
      en: "/tools/menu-cost-calculator",
      fr: "/outils/calculateur-cout-menu",
    },
    "/tools/pour-cost-calculator": {
      en: "/tools/pour-cost-calculator",
      fr: "/outils/calculateur-cout-matiere-bar",
    },
    "/guides/[slug]": {
      en: "/guides/[slug]",
      fr: "/guides/[slug]",
    },
    "/about": {
      en: "/about",
      fr: "/a-propos",
    },
    "/authors/[slug]": "/authors/[slug]",
    "/privacy": {
      en: "/privacy",
      fr: "/confidentialite",
    },
    "/terms": {
      en: "/terms",
      fr: "/conditions",
    },
    "/login": "/login",
    "/dashboard": "/dashboard",
    "/ingredients": "/ingredients",
    "/recipes": "/recipes",
    "/recipes/[id]": "/recipes/[id]",
    "/profitability": "/profitability",
    "/reports": "/reports",
    "/settings": "/settings",
    "/settings/billing": "/settings/billing",
    "/admin": "/admin",
    "/admin/customers": "/admin/customers",
    "/admin/customers/[id]": "/admin/customers/[id]",
    "/admin/support": "/admin/support",
    "/admin/support/[id]": "/admin/support/[id]",
    "/admin/announcements": "/admin/announcements",
    "/admin/audit": "/admin/audit",
    "/admin/ops": "/admin/ops",
    "/admin/content": "/admin/content",
    "/support": "/support",
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
