/**
 * Reusable JSON-LD schema components (PRD §9-A). All server-rendered, emitted as
 * <script type="application/ld+json">. Keep values factual — no fabricated
 * reviews or ratings until genuine data exists.
 */
import { Fragment } from "react";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (no user HTML); escape < to avoid breakouts.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSchema({ items }: { items: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.question,
          acceptedAnswer: { "@type": "Answer", text: it.answer },
        })),
      }}
    />
  );
}

export interface HowToStep {
  name: string;
  text: string;
}

export function HowToSchema({
  name,
  steps,
}: {
  name: string;
  steps: HowToStep[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }}
    />
  );
}

export interface Crumb {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.url,
        })),
      }}
    />
  );
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  priceCents,
  currency,
}: {
  name: string;
  description: string;
  url: string;
  priceCents: number;
  currency: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: (priceCents / 100).toFixed(2),
          priceCurrency: currency,
        },
      }}
    />
  );
}

export function OrganizationSchema({
  url,
  logoUrl,
  sameAs,
}: {
  url: string;
  logoUrl: string;
  sameAs: string[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PixPlat",
        url,
        logo: logoUrl,
        sameAs,
      }}
    />
  );
}

export function ImageObjectSchema({
  contentUrl,
  caption,
  width,
  height,
}: {
  contentUrl: string;
  caption: string;
  width?: number;
  height?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl,
        caption,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
    />
  );
}

export function ArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
  locale,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  locale: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description,
        url,
        datePublished,
        dateModified,
        inLanguage: locale,
        author: { "@type": "Person", name: authorName },
        publisher: {
          "@type": "Organization",
          name: "PixPlat",
          url: "https://pixplat.com",
        },
      }}
    />
  );
}

/** Convenience wrapper to emit several schema blocks together. */
export function SchemaGroup({ children }: { children: React.ReactNode }) {
  return <Fragment>{children}</Fragment>;
}
