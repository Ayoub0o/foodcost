import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MarkdownBody } from "@/components/content/MarkdownBody";
import { BreadcrumbSchema } from "@/components/seo/schema";
import { loadHelpArticle, loadHelpArticles } from "@/lib/content/load";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

export function generateStaticParams() {
  return loadHelpArticles().map((a) => ({
    locale: a.frontmatter.locale,
    slug: a.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = loadHelpArticle(locale as ContentLocale, slug);
  if (!doc) return {};
  const path = locale === "fr" ? `/aide/${slug}` : `/help/${slug}`;
  const canonical = absoluteUrl(locale, path);
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    alternates: {
      canonical,
      languages: hreflangAlternates({
        en: `/help/${slug}`,
        fr: `/aide/${slug}`,
      }),
    },
    openGraph: {
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = loadHelpArticle(locale as ContentLocale, slug);
  if (!doc) notFound();
  const path = locale === "fr" ? `/aide/${slug}` : `/help/${slug}`;
  const canonical = absoluteUrl(locale, path);

  return (
    <main className="container-bringer py-16">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: absoluteUrl(locale, "/") },
          { name: "Help", url: absoluteUrl(locale, locale === "fr" ? "/aide" : "/help") },
          { name: doc.frontmatter.title, url: canonical },
        ]}
      />
      <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-heading">
        {doc.frontmatter.title}
      </h1>
      <p className="mt-2 text-xs text-text">
        Updated{" "}
        {new Date(doc.frontmatter.updatedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
      </p>
      <article className="mt-10 max-w-3xl">
        <MarkdownBody source={doc.body} />
      </article>
    </main>
  );
}
