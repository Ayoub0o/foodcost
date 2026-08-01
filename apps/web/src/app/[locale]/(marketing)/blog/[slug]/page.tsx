import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarkdownBody } from "@/components/content/MarkdownBody";
import { AuthorBlock } from "@/components/content/AuthorBlock";
import { Definition } from "@/components/tools/Definition";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/schema";
import { loadAuthor, loadBlogPost, loadBlogPosts } from "@/lib/content/load";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

export function generateStaticParams() {
  return loadBlogPosts().map((p) => ({ locale: p.frontmatter.locale, slug: p.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = loadBlogPost(locale as ContentLocale, slug);
  if (!post) return {};
  const canonical = absoluteUrl(locale, `/blog/${slug}`);
  const pairLocale = locale === "en" ? "fr" : "en";
  const languages = hreflangAlternates({
    [locale]: `/blog/${slug}`,
    [pairLocale]: `/blog/${post.frontmatter.translationOf}`,
  });
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical, languages },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "article",
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = loadBlogPost(locale as ContentLocale, slug);
  if (!post) notFound();

  const author = loadAuthor(post.frontmatter.author);
  const related = loadBlogPosts(locale as ContentLocale)
    .filter(
      (p) =>
        p.frontmatter.category === post.frontmatter.category &&
        p.frontmatter.slug !== slug,
    )
    .slice(0, 3);

  const canonical = absoluteUrl(locale, `/blog/${slug}`);
  const defText = post.frontmatter.description;

  return (
    <div className="container-bringer py-16">
      <ArticleSchema
        headline={post.frontmatter.title}
        description={post.frontmatter.description}
        url={canonical}
        datePublished={post.frontmatter.publishedAt}
        dateModified={post.frontmatter.updatedAt}
        authorName={author?.frontmatter.name ?? post.frontmatter.author}
        locale={locale}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: absoluteUrl(locale, "/") },
          { name: "Blog", url: absoluteUrl(locale, "/blog") },
          { name: post.frontmatter.category, url: absoluteUrl(locale, "/blog") },
          { name: post.frontmatter.title, url: canonical },
        ]}
      />

      <p className="text-xs uppercase tracking-[0.12em] text-accent-text">{post.frontmatter.category}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-heading md:text-5xl">
        {post.frontmatter.title}
      </h1>
      <div className="mt-6">
        <Definition>{defText}</Definition>
      </div>

      <article className="mt-10 max-w-3xl">
        <MarkdownBody source={post.body} />
        <AuthorBlock
          name={author?.frontmatter.name ?? post.frontmatter.author}
          role={author?.frontmatter.role}
          slug={post.frontmatter.author}
          updatedAt={post.frontmatter.updatedAt}
          locale={locale}
        />
      </article>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-semibold text-heading">
            {locale === "fr" ? "Dans la même catégorie" : "Related"}
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.frontmatter.slug}>
                <Link
                  href={{ pathname: "/blog/[slug]", params: { slug: r.frontmatter.slug } }}
                  className="text-accent-text hover:underline"
                >
                  {r.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
