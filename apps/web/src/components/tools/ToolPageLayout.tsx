import type { ReactNode } from "react";
import {
  BreadcrumbSchema,
  FaqSchema,
  HowToSchema,
  ImageObjectSchema,
  SoftwareApplicationSchema,
  type Crumb,
} from "@/components/seo/schema";
import { siteConfig } from "@/lib/site";
import { Definition } from "./Definition";
import { BenchmarkInfographic, type BenchmarkRow } from "./BenchmarkInfographic";

export interface ToolPageContent {
  hero: { h1: string; trustLine: string; intro: string };
  definition: string;
  stats: { label: string; value: string }[];
  features: { title: string; body: string }[]; // 6 blocks
  howTo: { title: string; steps: { name: string; text: string }[] };
  formulas: { title: string; items: { name: string; formula: string; example: string }[] };
  benchmarks: { title: string; caption: string; rows: BenchmarkRow[]; columns: [string, string] };
  audiences: { title: string; items: string[] };
  faq: { title: string; items: { question: string; answer: string }[] };
  finalCta: { title: string; body: string; ctaLabel: string };
}

interface ToolPageLayoutProps {
  content: ToolPageContent;
  /** The interactive calculator block (client component). */
  calculator: ReactNode;
  /** Absolute canonical URL of this page (for schema). */
  canonicalUrl: string;
  /** Breadcrumb trail (already localized + absolute). */
  breadcrumbs: Crumb[];
  trialHref: string;
}

/**
 * Enforces the 10-block Tool Page Content Template (PRD §9-A A1) in order:
 * 1 hero · 2 stats strip · 3 calculator · 4 features grid ×6 · 5 HowTo ·
 * 6 formulas (text) · 7 benchmarks table + infographic · 8 audiences ·
 * 9 FAQ ≥7 · 10 final CTA. Every tool page is an instance of this layout.
 */
export function ToolPageLayout({
  content,
  calculator,
  canonicalUrl,
  breadcrumbs,
  trialHref,
}: ToolPageLayoutProps) {
  const { hero, stats, features, howTo, formulas, benchmarks, audiences, faq, finalCta } = content;

  return (
    <main>
      {/* Schema (server-rendered JSON-LD) */}
      <BreadcrumbSchema items={breadcrumbs} />
      <SoftwareApplicationSchema
        name={siteConfig.name}
        description={hero.intro}
        url={canonicalUrl}
        priceCents={siteConfig.priceCents}
        currency={siteConfig.currency}
      />
      <HowToSchema name={howTo.title} steps={howTo.steps} />
      <FaqSchema items={faq.items} />
      <ImageObjectSchema
        contentUrl={`${canonicalUrl}#benchmark-infographic`}
        caption={benchmarks.title}
        width={720}
      />

      {/* 1 — Hero */}
      <section className="border-b border-border-mute">
        <div className="container-bringer py-16 md:py-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
            {hero.trustLine}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-heading md:text-6xl">
            {hero.h1}
          </h1>
          <div className="mt-6 max-w-2xl">
            <Definition>{content.definition}</Definition>
          </div>
          <p className="mt-5 max-w-2xl text-text">{hero.intro}</p>
        </div>
      </section>

      {/* 2 — Stats strip */}
      <section className="border-b border-border-mute bg-container/40">
        <div className="container-bringer grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-semibold text-heading">{s.value}</p>
              <p className="text-xs text-text">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — Calculator */}
      <section className="container-bringer py-12 md:py-16">{calculator}</section>

      {/* 4 — Features grid (6) */}
      <section className="container-bringer py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-container p-6">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-heading">{f.title}</h2>
              <p className="mt-2 text-sm text-text">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 — How to (HowTo schema) */}
      <section className="container-bringer py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {howTo.title}
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {howTo.steps.map((s, i) => (
            <li key={s.name} className="rounded-lg border border-border bg-container p-6">
              <span className="text-sm font-semibold text-accent-text">{i + 1}</span>
              <h3 className="mt-2 text-base font-semibold text-heading">{s.name}</h3>
              <p className="mt-2 text-sm text-text">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6 — Formulas (text, never images) */}
      <section className="container-bringer py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {formulas.title}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {formulas.items.map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-container p-6">
              <h3 className="text-base font-semibold text-heading">{f.name}</h3>
              <p className="mt-3 rounded-xs bg-body px-4 py-3 font-mono text-sm text-accent-text">
                {f.formula}
              </p>
              <p className="mt-3 text-sm text-text">{f.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — Benchmarks table + infographic */}
      <section className="container-bringer py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {benchmarks.title}
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-container text-heading">
                <tr>
                  <th className="px-4 py-3 font-semibold">{benchmarks.columns[0]}</th>
                  <th className="px-4 py-3 font-semibold">{benchmarks.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.rows.map((r) => (
                  <tr key={r.type} className="border-t border-border-mute">
                    <td className="px-4 py-3 text-text">{r.type}</td>
                    <td className="px-4 py-3 text-heading">{r.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-border bg-container p-6">
            <BenchmarkInfographic rows={benchmarks.rows} title={benchmarks.title} />
          </div>
        </div>
        <p className="mt-4 text-xs text-text">{benchmarks.caption}</p>
      </section>

      {/* 8 — Audiences */}
      <section className="container-bringer py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {audiences.title}
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {audiences.items.map((a) => (
            <span key={a} className="rounded-xs border border-border px-4 py-2 text-sm text-text">
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* 9 — FAQ (accordion, works without JS) */}
      <section className="container-bringer py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
          {faq.title}
        </h2>
        <div className="mt-8 space-y-3">
          {faq.items.map((it) => (
            <details key={it.question} className="rounded-lg border border-border bg-container p-5">
              <summary className="cursor-pointer text-base font-semibold text-heading">
                {it.question}
              </summary>
              <p className="mt-3 text-sm text-text">{it.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 10 — Final CTA */}
      <section className="container-bringer py-16 md:py-24">
        <div className="rounded-lg border border-border-accent bg-container p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading md:text-4xl">
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text">{finalCta.body}</p>
          <a href={trialHref} className="btn-accent mt-8 inline-flex">
            {finalCta.ctaLabel}
          </a>
        </div>
      </section>
    </main>
  );
}
