import { routing } from "@/i18n/routing";

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixplat.com";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";

export const siteConfig = {
  name: "FoodCost by PixPlat",
  /** Absolute origin without base path, e.g. https://pixplat.com */
  origin: RAW_SITE_URL.replace(/\/$/, ""),
  /** Base path the app is served under, e.g. /foodcost */
  basePath: BASE_PATH,
  /** Absolute root including base path, e.g. https://pixplat.com/foodcost */
  root: `${RAW_SITE_URL.replace(/\/$/, "")}${BASE_PATH}`,
  priceCents: 1200,
  currency: "CAD",
  sameAs: [
    "https://pixplat.com",
    "https://www.youtube.com/@pixplat",
  ],
} as const;

/** Absolute URL for a localized path (path is the localized slug, e.g. /calculateur-food-cost). */
export function absoluteUrl(locale: string, localizedPath: string): string {
  const clean = localizedPath === "/" ? "" : localizedPath;
  return `${siteConfig.root}/${locale}${clean}`;
}

/** hreflang alternates map for a given set of per-locale localized paths. */
export function hreflangAlternates(paths: Record<string, string>): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    const p = paths[locale];
    if (p) alternates[locale] = absoluteUrl(locale, p);
  }
  // x-default points to the default locale.
  const def = paths[routing.defaultLocale];
  if (def) alternates["x-default"] = absoluteUrl(routing.defaultLocale, def);
  return alternates;
}
