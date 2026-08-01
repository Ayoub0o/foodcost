import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FoodCostCalculator } from "@/components/tools/FoodCostCalculator";
import { BenchmarkInfographic } from "@/components/tools/BenchmarkInfographic";
import {
  FaqSchema,
  HowToSchema,
  OrganizationSchema,
  SoftwareApplicationSchema,
} from "@/components/seo/schema";
import { homeContentEn } from "@/content/home/en";
import { homeContentFr } from "@/content/home/fr";
import { calculatorLabelsEn } from "@/content/calculator/en";
import { calculatorLabelsFr } from "@/content/calculator/fr";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS: Record<string, string> = { en: "/", fr: "/" };

function pick(locale: string) {
  return locale === "fr"
    ? { c: homeContentFr, labels: calculatorLabelsFr }
    : { c: homeContentEn, labels: calculatorLabelsEn };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { c } = pick(locale);
  const canonical = absoluteUrl(locale, "/");
  return {
    title: c.hero.h1,
    description: c.hero.subtitle,
    alternates: { canonical, languages: hreflangAlternates(SLUGS) },
    openGraph: {
      title: c.hero.h1,
      description: c.hero.subtitle,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { locale } = await params;
  const { deleted } = await searchParams;
  setRequestLocale(locale);
  const { c, labels } = pick(locale);
  const trialHref = `${siteConfig.basePath}/${locale}/login`;

  return (
    <div>
      {deleted === "1" && (
        <p
          className="border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300"
          data-testid="workspace-deleted-banner"
        >
          {locale === "fr"
            ? "Espace supprimé. Les données seront purgées sous 30 jours."
            : "Workspace deleted. Data will be purged within 30 days."}
        </p>
      )}
      <OrganizationSchema
        url={siteConfig.origin}
        logoUrl={`${siteConfig.root}/icon.png`}
        sameAs={[...siteConfig.sameAs]}
      />
      <SoftwareApplicationSchema
        name={siteConfig.name}
        description={c.hero.subtitle}
        url={absoluteUrl(locale, "/")}
        priceCents={siteConfig.priceCents}
        currency={siteConfig.currency}
      />
      <HowToSchema name={c.how.h2} steps={c.how.steps} />
      <FaqSchema items={c.faq.items} />

      {/* S1 — Hero */}
      <section className="border-b border-border-mute">
        <div className="container-bringer flex flex-col items-center py-20 text-center md:py-28">
          <span className="mb-6 rounded-xs border border-border-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
            {c.hero.trust}
          </span>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-heading md:text-6xl">
            {c.hero.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-text md:text-xl">{c.hero.subtitle}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login" className="btn-accent">
              {c.hero.ctaPrimary}
            </Link>
            <Link href="/calculator" className="btn-ghost">
              {c.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* S2 — Stats strip */}
      <section className="border-b border-border-mute bg-container/40">
        <div className="container-bringer grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-semibold text-heading">{s.value}</p>
              <p className="text-xs text-text">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* S3 — Problem narrative */}
      <section className="container-bringer py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
            {c.problem.h2}
          </h2>
          <div className="space-y-4 text-text">
            {c.problem.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <Link href="/calculator" className="inline-block text-accent-text underline">
              {c.problem.linkLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* S4 — Core features */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.features.h2}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {c.features.blocks.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-container p-6">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-heading">{f.title}</h3>
              <p className="mt-2 text-sm text-text">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* S5 — Embedded mini calculator (DEVIATION D1) */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.miniCalc.h2}
        </h2>
        <p className="mt-3 max-w-2xl text-text">{c.miniCalc.body}</p>
        <div className="mt-8">
          <FoodCostCalculator labels={labels} trialHref={trialHref} />
        </div>
        <Link href="/calculator" className="mt-4 inline-block text-accent-text underline">
          {c.miniCalc.openLabel} →
        </Link>
      </section>

      {/* S6 — How it works */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.how.h2}
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {c.how.steps.map((s, i) => (
            <li key={s.name} className="rounded-lg border border-border bg-container p-6">
              <span className="text-sm font-semibold text-accent-text">{i + 1}</span>
              <h3 className="mt-2 text-base font-semibold text-heading">{s.name}</h3>
              <p className="mt-2 text-sm text-text">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* S7 — Comparison table (DEVIATION D2, sourced) */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.comparison.h2}
        </h2>
        <div className="mt-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-container text-heading">
              <tr>
                {c.comparison.columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.comparison.rows.map((r) => (
                <tr
                  key={r.name}
                  className={`border-t border-border-mute ${r.highlight ? "bg-body/40" : ""}`}
                >
                  <td className="px-4 py-3 font-semibold text-heading">{r.name}</td>
                  <td className="px-4 py-3 text-text">{r.price}</td>
                  <td className="px-4 py-3 text-text">{r.selfServe}</td>
                  <td className="px-4 py-3 text-text">{r.frSupport}</td>
                  <td className="px-4 py-3 text-text">{r.singleLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-text">{c.comparison.sourceNote}</p>
      </section>

      {/* S8 — Benchmark data table + infographic */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.benchmarks.h2}
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-container text-heading">
                <tr>
                  <th className="px-4 py-3 font-semibold">{c.benchmarks.columns[0]}</th>
                  <th className="px-4 py-3 font-semibold">{c.benchmarks.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {c.benchmarks.rows.map((r) => (
                  <tr key={r.type} className="border-t border-border-mute">
                    <td className="px-4 py-3 text-text">{r.type}</td>
                    <td className="px-4 py-3 text-heading">{r.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-border bg-container p-6">
            <BenchmarkInfographic rows={c.benchmarks.rows} title={c.benchmarks.h2} id="home-benchmark" />
          </div>
        </div>
        <p className="mt-4 text-xs text-text">{c.benchmarks.caption}</p>
      </section>

      {/* S9 — Testimonials (no fabricated reviews) */}
      <section className="container-bringer py-16 md:py-24">
        <div className="rounded-lg border border-border bg-container p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
            {c.testimonials.h2}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text">{c.testimonials.note}</p>
        </div>
      </section>

      {/* S10 — FAQ */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.faq.h2}
        </h2>
        <div className="mt-8 space-y-3">
          {c.faq.items.map((it) => (
            <details key={it.question} className="rounded-lg border border-border bg-container p-5">
              <summary className="cursor-pointer text-base font-semibold text-heading">
                {it.question}
              </summary>
              <p className="mt-3 text-sm text-text">{it.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* S11 — Resources teaser */}
      <section className="container-bringer py-16 md:py-24">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {c.resources.h2}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {c.resources.cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-lg border border-border bg-container p-6 transition-colors hover:border-border-accent"
            >
              <h3 className="text-base font-semibold text-heading">{card.title}</h3>
              <p className="mt-2 text-sm text-text">{card.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* S12 — Final CTA */}
      <section className="container-bringer py-20 md:py-28">
        <div className="rounded-lg border border-border-accent bg-container p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
            {c.finalCta.h2}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text">{c.finalCta.body}</p>
          <Link href="/login" className="btn-accent mt-8 inline-flex">
            {c.finalCta.ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
