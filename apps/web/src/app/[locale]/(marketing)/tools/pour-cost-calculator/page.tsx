import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { FoodCostCalculator } from "@/components/tools/FoodCostCalculator";
import {
  pourCostContentEn,
  pourCostContentFr,
  pourCostLabelsEn,
  pourCostLabelsFr,
} from "@/content/tools/pour-cost";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS = {
  en: "/tools/pour-cost-calculator",
  fr: "/outils/calculateur-cout-matiere-bar",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = locale === "fr" ? pourCostContentFr : pourCostContentEn;
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"]!);
  return {
    title: content.hero.h1,
    description: content.hero.intro,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: {
      title: content.hero.h1,
      description: content.hero.intro,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function PourCostCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = locale === "fr" ? pourCostContentFr : pourCostContentEn;
  const labels = locale === "fr" ? pourCostLabelsFr : pourCostLabelsEn;
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"]!);
  const trialHref = `${siteConfig.basePath}/${locale}/login`;

  return (
    <ToolPageLayout
      content={content}
      canonicalUrl={canonical}
      trialHref={trialHref}
      breadcrumbs={[
        { name: "Home", url: absoluteUrl(locale, "/") },
        { name: content.hero.h1, url: canonical },
      ]}
      calculator={<FoodCostCalculator labels={labels} trialHref={trialHref} />}
    />
  );
}
