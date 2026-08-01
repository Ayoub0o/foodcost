import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Definition } from "@/components/tools/Definition";
import { BreadcrumbSchema } from "@/components/seo/schema";
import { getVsPage, VS_PAGES } from "@/content/vs/competitors";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return VS_PAGES.flatMap((p) => [
    { locale: "en", slug: p.slug },
    { locale: "fr", slug: p.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getVsPage(slug);
  if (!page) return {};
  const title = page.title[locale === "fr" ? "fr" : "en"];
  const description = page.description[locale === "fr" ? "fr" : "en"];
  const canonical = absoluteUrl(locale, `/vs/${slug}`);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangAlternates({ en: `/vs/${slug}`, fr: `/vs/${slug}` }),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function VsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = getVsPage(slug);
  if (!page) notFound();
  const loc = locale === "fr" ? "fr" : "en";
  const canonical = absoluteUrl(locale, `/vs/${slug}`);
  const rows = page.rows[loc];

  return (
    <main className="container-bringer py-16">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: absoluteUrl(locale, "/") },
          { name: "Compare", url: canonical },
          { name: page.title[loc], url: canonical },
        ]}
      />
      <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-heading md:text-5xl">
        {page.title[loc]}
      </h1>
      <p className="mt-2 text-xs text-text">
        Last updated{" "}
        {new Date(page.updatedAt).toLocaleDateString(loc === "fr" ? "fr-CA" : "en-CA")}
      </p>
      <div className="mt-6">
        <Definition>{page.definition[loc]}</Definition>
      </div>

      <div className="mt-10 overflow-x-auto" data-testid="vs-table">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-container text-heading">
              <th className="border border-border px-3 py-2 text-left">
                {loc === "fr" ? "Critère" : "Feature"}
              </th>
              <th className="border border-border px-3 py-2 text-left">FoodCost</th>
              <th className="border border-border px-3 py-2 text-left">{page.competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feature}>
                <td className="border border-border px-3 py-2 font-medium text-heading">{r.feature}</td>
                <td className="border border-border px-3 py-2 text-text">{r.foodcost}</td>
                <td className="border border-border px-3 py-2 text-text">{r.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 text-sm text-text" data-testid="vs-sources">
        <h2 className="text-lg font-semibold text-heading">
          {loc === "fr" ? "Sources" : "Sources"}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {page.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="text-accent-text underline" rel="noopener noreferrer">
                {s.label}
              </a>{" "}
              — retrieved {s.retrievedAt}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <Link href="/pricing" className="btn-accent">
          {loc === "fr" ? "Voir les tarifs FoodCost" : "See FoodCost pricing"}
        </Link>
      </div>
    </main>
  );
}
