import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalDoc } from "@/content/legal";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS = { en: "/terms", fr: "/conditions" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getLegalDoc("terms", locale);
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"] ?? "/terms");
  return {
    title: doc.title,
    description: doc.sections[0]?.paragraphs[0]?.slice(0, 160) ?? doc.title,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: {
      title: doc.title,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getLegalDoc("terms", locale);
  return <LegalDocument doc={doc} />;
}
