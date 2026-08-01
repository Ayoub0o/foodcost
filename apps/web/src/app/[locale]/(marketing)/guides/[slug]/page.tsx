import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MarkdownBody } from "@/components/content/MarkdownBody";
import { AuthorBlock } from "@/components/content/AuthorBlock";
import { Definition } from "@/components/tools/Definition";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/schema";
import { loadAuthor, loadGuide, loadGuides } from "@/lib/content/load";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

export function generateStaticParams() {
  return loadGuides().map((g) => ({
    locale: g.frontmatter.locale,
    slug: g.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = loadGuide(locale as ContentLocale, slug);
  if (!doc) return {};
  const canonical = absoluteUrl(locale, `/guides/${slug}`);
  const pairLocale = locale === "en" ? "fr" : "en";
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    alternates: {
      canonical,
      languages: hreflangAlternates({
        [locale]: `/guides/${slug}`,
        [pairLocale]: `/guides/${doc.frontmatter.translationOf}`,
      }),
    },
    openGraph: {
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "article",
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = loadGuide(locale as ContentLocale, slug);
  if (!doc) notFound();
  const author = loadAuthor(doc.frontmatter.author);
  const canonical = absoluteUrl(locale, `/guides/${slug}`);

  return (
    <main className="container-bringer py-16">
      <ArticleSchema
        headline={doc.frontmatter.title}
        description={doc.frontmatter.description}
        url={canonical}
        datePublished={doc.frontmatter.publishedAt}
        dateModified={doc.frontmatter.updatedAt}
        authorName={author?.frontmatter.name ?? doc.frontmatter.author}
        locale={locale}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: absoluteUrl(locale, "/") },
          { name: "Guides", url: absoluteUrl(locale, `/guides/${slug}`) },
          { name: doc.frontmatter.title, url: canonical },
        ]}
      />
      <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-heading md:text-5xl">
        {doc.frontmatter.title}
      </h1>
      <div className="mt-6">
        <Definition>{doc.frontmatter.definition}</Definition>
      </div>
      <article className="mt-10 max-w-3xl">
        <MarkdownBody source={doc.body} />
        <AuthorBlock
          name={author?.frontmatter.name ?? doc.frontmatter.author}
          role={author?.frontmatter.role}
          slug={doc.frontmatter.author}
          updatedAt={doc.frontmatter.updatedAt}
          locale={locale}
        />
      </article>
    </main>
  );
}
