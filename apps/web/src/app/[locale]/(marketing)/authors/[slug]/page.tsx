import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MarkdownBody } from "@/components/content/MarkdownBody";
import { loadAuthor, loadAuthors, loadBlogPosts } from "@/lib/content/load";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, siteConfig } from "@/lib/site";
import type { ContentLocale } from "@/lib/content/types";

export function generateStaticParams() {
  return loadAuthors().flatMap((a) => [
    { locale: "en", slug: a.frontmatter.slug },
    { locale: "fr", slug: a.frontmatter.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = loadAuthor(slug);
  if (!author) return {};
  return {
    title: author.frontmatter.name,
    description: author.frontmatter.bio,
    openGraph: { title: author.frontmatter.name, description: author.frontmatter.bio, siteName: siteConfig.name },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const author = loadAuthor(slug);
  if (!author) notFound();
  const posts = loadBlogPosts(locale as ContentLocale).filter(
    (p) => p.frontmatter.author === slug,
  );

  return (
    <main className="container-bringer py-16">
      <h1 className="text-4xl font-semibold text-heading">{author.frontmatter.name}</h1>
      <p className="mt-2 text-accent-text">{author.frontmatter.role}</p>
      <div className="mt-8 max-w-2xl">
        <MarkdownBody source={author.body || author.frontmatter.bio} />
      </div>
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-heading">
          {locale === "fr" ? "Articles" : "Articles"}
        </h2>
        <ul className="mt-4 space-y-2">
          {posts.map((p) => (
            <li key={p.frontmatter.slug}>
              <Link
                href={{ pathname: "/blog/[slug]", params: { slug: p.frontmatter.slug } }}
                className="text-accent-text hover:underline"
              >
                {p.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8 text-xs text-text">{absoluteUrl(locale, `/authors/${slug}`)}</p>
    </main>
  );
}
