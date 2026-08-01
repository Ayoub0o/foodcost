import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/app/PageHeader";
import { loadBlogPosts, loadGuides, loadHelpArticles } from "@/lib/content/load";

/** File-based Blog + Help CMS listing (DIRECTIVE §7.4/§7.5). */
export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = loadBlogPosts();
  const help = loadHelpArticles();
  const guides = loadGuides(undefined, { includeDrafts: true });

  return (
    <div className="container-bringer py-10">
      <PageHeader
        title="Content CMS"
        subtitle="MDX in /content — edit in git; no WYSIWYG in MVP."
      />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-heading">Blog ({posts.length})</h2>
        <ul className="mt-3 space-y-1 text-sm text-text">
          {posts.map((p) => (
            <li key={p.filePath}>
              [{p.frontmatter.locale}] {p.frontmatter.slug} — {p.frontmatter.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-heading">Help ({help.length})</h2>
        <ul className="mt-3 space-y-1 text-sm text-text">
          {help.map((p) => (
            <li key={p.filePath}>
              [{p.frontmatter.locale}] {p.frontmatter.slug}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-heading">Guides ({guides.length})</h2>
        <ul className="mt-3 space-y-1 text-sm text-text">
          {guides.map((p) => (
            <li key={p.filePath}>
              [{p.frontmatter.locale}] {p.frontmatter.draft ? "DRAFT " : ""}
              {p.frontmatter.slug}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
