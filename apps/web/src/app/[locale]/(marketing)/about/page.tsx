import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Definition } from "@/components/tools/Definition";
import { OrganizationSchema } from "@/components/seo/schema";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS = { en: "/about", fr: "/a-propos" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "fr" ? "À propos de FoodCost by PixPlat" : "About FoodCost by PixPlat";
  const description =
    locale === "fr"
      ? "FoodCost est le micro-SaaS de food cost de PixPlat pour restaurants indépendants."
      : "FoodCost is PixPlat's food cost micro-SaaS for independent restaurants.";
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"]!);
  return {
    title,
    description,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: { title, description, url: canonical, siteName: siteConfig.name, locale: locale === "fr" ? "fr_CA" : "en_CA" },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";

  return (
    <main className="container-bringer py-16">
      <OrganizationSchema
        url="https://pixplat.com"
        logoUrl="https://pixplat.com/favicon.ico"
        sameAs={[...siteConfig.sameAs]}
      />
      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-heading">
        {fr ? "À propos de FoodCost" : "About FoodCost"}
      </h1>
      <div className="mt-6">
        <Definition>
          {fr
            ? "FoodCost by PixPlat est un logiciel bilingue de gestion du coût matière pour restaurants indépendants : costing de recettes, propagation des prix et exports Excel à 12 $/mois, sans appel de démo."
            : "FoodCost by PixPlat is bilingual food cost software for independent restaurants: recipe costing, price propagation, and Excel exports at $12/mo — no demo call."}
        </Definition>
      </div>
      <div className="mt-8 max-w-2xl space-y-4 text-text">
        <p>
          {fr
            ? "PixPlat est basé à Montréal et sert des opérateurs au Canada, aux États-Unis et en Europe. FoodCost applique le plus strict dénominateur commun Loi 25 / RGPD."
            : "PixPlat is Montréal-based and serves operators across Canada, the US, and Europe. FoodCost is designed for Quebec Law 25 + GDPR as the strictest common denominator."}
        </p>
        <p>
          <Link href={{ pathname: "/authors/[slug]", params: { slug: "pixplat-team" } }} className="text-accent-text underline">
            {fr ? "Équipe éditoriale" : "Editorial team"}
          </Link>
        </p>
      </div>
    </main>
  );
}
