import type { MetadataRoute } from "next";
import { allowSearchIndexing } from "@/lib/env";
import { siteConfig } from "@/lib/site";

// Must evaluate FOODCOST_ENV / VERCEL_ENV at request time (not build time).
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!allowSearchIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: siteConfig.origin,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated areas should not be indexed.
      disallow: ["/en/dashboard", "/fr/dashboard", "/api/"],
    },
    sitemap: `${siteConfig.root}/sitemap.xml`,
    host: siteConfig.origin,
  };
}
