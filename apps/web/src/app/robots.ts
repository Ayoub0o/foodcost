import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
