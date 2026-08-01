import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/content/legal";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS = { en: "/privacy", fr: "/confidentialite" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getLegalDoc("privacy", locale);
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"] ?? "/privacy");
  return {
    title: doc.title,
    description: doc.intro?.slice(0, 160) ?? doc.title,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: {
      title: doc.title,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getLegalDoc("privacy", locale);
  return <LegalDocument doc={doc} />;
}
