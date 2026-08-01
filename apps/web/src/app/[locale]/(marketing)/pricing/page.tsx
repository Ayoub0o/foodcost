import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Definition } from "@/components/tools/Definition";
import {
  BreadcrumbSchema,
  FaqSchema,
  SoftwareApplicationSchema,
} from "@/components/seo/schema";
import { pricingContentEn } from "@/content/pricing/en";
import { pricingContentFr } from "@/content/pricing/fr";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";

const SLUGS: Record<string, string> = {
  en: "/pricing",
  fr: "/tarifs",
};

function pick(locale: string) {
  return locale === "fr" ? pricingContentFr : pricingContentEn;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = pick(locale);
  const canonical = absoluteUrl(locale, SLUGS[locale] ?? SLUGS.en!);

  return {
    title: c.hero.h1,
    description: c.hero.subtitle,
    alternates: {
      canonical,
      languages: hreflangAlternates(SLUGS),
    },
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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = pick(locale);
  const canonical = absoluteUrl(locale, SLUGS[locale] ?? SLUGS.en!);
  const homeLabel = locale === "fr" ? "Accueil" : "Home";

  return (
    <main>
      <SoftwareApplicationSchema
        name={siteConfig.name}
        description={c.definition}
        url={canonical}
        priceCents={siteConfig.priceCents}
        currency={siteConfig.currency}
      />
      <BreadcrumbSchema
        items={[
          { name: homeLabel, url: absoluteUrl(locale, "/") },
          { name: c.hero.h1, url: canonical },
        ]}
      />
      <FaqSchema items={c.faq.items} />

      {/* Hero */}
      <section className="border-b border-border-mute">
        <div className="container-bringer flex flex-col items-center py-20 text-center md:py-28">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-heading md:text-6xl">
            {c.hero.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-text md:text-xl">{c.hero.subtitle}</p>
        </div>
      </section>

      {/* Definition */}
      <section className="container-bringer pt-12">
        <div className="mx-auto max-w-3xl">
          <Definition>{c.definition}</Definition>
        </div>
      </section>

      {/* Plan card */}
      <section className="container-bringer py-16 md:py-20">
        <div className="mx-auto max-w-xl rounded-lg border border-border-accent bg-container p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-text">
            {c.plan.name}
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-[-0.05em] text-heading">
              {c.plan.price}
            </span>
            <span className="pb-1 text-text">{c.plan.period}</span>
          </div>
          <p className="mt-1 text-sm text-text">{c.plan.yearlyNote}</p>
          <Link href="/login" className="btn-accent mt-8 inline-flex w-full justify-center">
            {c.plan.ctaLabel}
          </Link>
          <ul className="mt-8 space-y-3">
            {c.plan.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-text">
                <span aria-hidden className="mt-0.5 font-semibold text-accent-text">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trial reassurance */}
      <section className="container-bringer pb-16 md:pb-20">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-container/60 p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-heading">
            {c.trial.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text">{c.trial.body}</p>
        </div>
      </section>

      {/* FAQ */}
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

      {/* Final CTA */}
      <section className="container-bringer py-16 md:py-24">
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
    </main>
  );
}
