import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { FoodCostCalculator } from "@/components/tools/FoodCostCalculator";
import { calculatorContentEn, calculatorLabelsEn } from "@/content/calculator/en";
import { calculatorContentFr, calculatorLabelsFr } from "@/content/calculator/fr";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS: Record<string, string> = {
  en: "/calculator",
  fr: "/calculateur-food-cost",
};

function pick(locale: string) {
  return locale === "fr"
    ? { content: calculatorContentFr, labels: calculatorLabelsFr }
    : { content: calculatorContentEn, labels: calculatorLabelsEn };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { content } = pick(locale);
  const canonical = absoluteUrl(locale, SLUGS[locale] ?? SLUGS.en!);

  return {
    title: content.hero.h1,
    description: content.hero.intro,
    alternates: {
      canonical,
      languages: hreflangAlternates(SLUGS),
    },
    openGraph: {
      title: content.hero.h1,
      description: content.hero.intro,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { content, labels } = pick(locale);

  const canonical = absoluteUrl(locale, SLUGS[locale] ?? SLUGS.en!);
  const trialHref = `${siteConfig.basePath}/${locale}/login`;
  const homeLabel = locale === "fr" ? "Accueil" : "Home";

  return (
    <ToolPageLayout
      content={content}
      canonicalUrl={canonical}
      trialHref={trialHref}
      breadcrumbs={[
        { name: homeLabel, url: absoluteUrl(locale, "/") },
        { name: content.hero.h1, url: canonical },
      ]}
      calculator={<FoodCostCalculator labels={labels} trialHref={trialHref} />}
    />
  );
}
