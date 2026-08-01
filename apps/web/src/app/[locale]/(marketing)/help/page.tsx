import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { loadHelpArticles } from "@/lib/content/load";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

const SLUGS = { en: "/help", fr: "/aide" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "fr" ? "Centre d'aide FoodCost" : "FoodCost Help Center";
  const description =
    locale === "fr"
      ? "Guides produit : démarrage, CSV, rendement, propagation, exports, facturation."
      : "Product guides: getting started, CSV, yield, propagation, exports, billing.";
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"]!);
  return {
    title,
    description,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: { title, description, url: canonical, siteName: siteConfig.name, locale: locale === "fr" ? "fr_CA" : "en_CA" },
  };
}

export default async function HelpIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = loadHelpArticles(locale as ContentLocale);

  return (
    <main className="container-bringer py-16">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-heading">
        {locale === "fr" ? "Centre d'aide" : "Help Center"}
      </h1>
      <ul className="mt-10 max-w-2xl space-y-4" data-testid="help-list">
        {articles.map((a) => (
          <li key={a.frontmatter.slug}>
            <Link
              href={{ pathname: "/help/[slug]", params: { slug: a.frontmatter.slug } }}
              className="text-lg font-medium text-accent-text hover:underline"
            >
              {a.frontmatter.title}
            </Link>
            <p className="text-sm text-text">{a.frontmatter.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10">
        <Link href="/help/contact" className="btn-accent !px-4 !py-2 text-sm">
          {locale === "fr" ? "Contacter le support" : "Contact support"}
        </Link>
      </p>
    </main>
  );
}
