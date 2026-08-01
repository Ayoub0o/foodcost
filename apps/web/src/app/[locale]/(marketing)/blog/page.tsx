import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { loadBlogPosts } from "@/lib/content/load";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

const SLUGS = { en: "/blog", fr: "/blog" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "fr" ? "Blog FoodCost" : "FoodCost blog";
  const description =
    locale === "fr"
      ? "Guides food cost, fiche technique, menu engineering et benchmarks."
      : "Guides on food cost, technical sheets, menu engineering, and benchmarks.";
  const canonical = absoluteUrl(locale, SLUGS[locale as "en" | "fr"] ?? "/blog");
  return {
    title,
    description,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: { title, description, url: canonical, siteName: siteConfig.name, locale: locale === "fr" ? "fr_CA" : "en_CA" },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const allPosts = loadBlogPosts(locale as ContentLocale);
  const posts = allPosts.filter((p) => !category || p.frontmatter.category === category);
  const categories = [...new Set(allPosts.map((p) => p.frontmatter.category))];

  return (
    <div className="container-bringer py-16">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-heading md:text-5xl">
        {locale === "fr" ? "Blog" : "Blog"}
      </h1>
      <p className="mt-4 max-w-2xl text-text">
        {locale === "fr"
          ? "Articles pour indépendants qui veulent un food cost fiable."
          : "Articles for independents who want reliable food cost."}
      </p>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link href="/blog" className="rounded-xs border border-border px-3 py-1 text-text hover:text-heading">
          {locale === "fr" ? "Tous" : "All"}
        </Link>
        {categories.map((c) => (
          <a
            key={c}
            href={`${siteConfig.basePath}/${locale}/blog?category=${c}`}
            className="rounded-xs border border-border px-3 py-1 text-text hover:text-heading"
          >
            {c}
          </a>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2" data-testid="blog-grid">
        {posts.map((p) => (
          <article key={p.frontmatter.slug} className="border-b border-border-mute pb-6">
            <p className="text-xs uppercase tracking-[0.12em] text-accent-text">{p.frontmatter.category}</p>
            <h2 className="mt-2 text-xl font-semibold text-heading">
              <Link href={{ pathname: "/blog/[slug]", params: { slug: p.frontmatter.slug } }}>
                {p.frontmatter.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-text">{p.frontmatter.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
