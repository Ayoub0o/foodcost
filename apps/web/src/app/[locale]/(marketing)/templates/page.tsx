import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Definition } from "@/components/tools/Definition";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/schema";
import { templatesContentEn } from "@/content/templates/en";
import { templatesContentFr } from "@/content/templates/fr";
import { absoluteUrl, hreflangAlternates, siteConfig } from "@/lib/site";
import { captureLead } from "./actions";

const SLUGS: Record<string, string> = {
  en: "/templates",
  fr: "/modeles",
};

function pick(locale: string) {
  return locale === "fr" ? templatesContentFr : templatesContentEn;
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

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ unlocked?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { unlocked, error } = await searchParams;
  setRequestLocale(locale);
  const c = pick(locale);
  const canonical = absoluteUrl(locale, SLUGS[locale] ?? SLUGS.en!);
  const homeLabel = locale === "fr" ? "Accueil" : "Home";
  const isUnlocked = unlocked === "1";

  return (
    <main>
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

      {/* Downloads + gate */}
      <section className="container-bringer py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Template cards */}
          <div className="space-y-6">
            {c.downloads.map((d) => (
              <div key={d.file} className="rounded-lg border border-border bg-container p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
                  {d.format}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-heading">
                  {d.title}
                </h2>
                <p className="mt-2 text-sm text-text">{d.description}</p>
                {isUnlocked && (
                  <a
                    href={`${siteConfig.basePath}/templates/${d.file}`}
                    download
                    className="btn-accent mt-4 inline-flex"
                  >
                    {c.unlocked.downloadLabel} →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Email gate / success */}
          <div className="rounded-lg border border-border-accent bg-container p-8 self-start">
            {isUnlocked ? (
              <>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-heading">
                  {c.unlocked.title}
                </h2>
                <p className="mt-3 text-sm text-text">{c.unlocked.body}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-heading">
                  {c.form.heading}
                </h2>
                <form action={captureLead} className="mt-6 space-y-4">
                  <input type="hidden" name="locale" value={locale} />
                  <div>
                    <label
                      htmlFor="lead-email"
                      className="block text-sm font-medium text-heading"
                    >
                      {c.form.emailLabel}
                    </label>
                    <input
                      id="lead-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={c.form.emailPlaceholder}
                      className="mt-2 w-full rounded-sm border border-border bg-body px-4 py-3 text-heading outline-none focus:border-border-accent"
                    />
                  </div>
                  {error === "email" && (
                    <p className="text-sm text-red-500">{c.form.invalidEmail}</p>
                  )}
                  <button type="submit" className="btn-accent w-full justify-center">
                    {c.form.submitLabel}
                  </button>
                  <p className="text-xs text-text">{c.form.consent}</p>
                </form>
              </>
            )}
          </div>
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
