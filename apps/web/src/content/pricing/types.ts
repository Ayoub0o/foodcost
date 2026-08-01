export interface PricingContent {
  hero: { h1: string; subtitle: string };
  definition: string;
  plan: {
    name: string;
    price: string;
    period: string;
    yearlyNote: string;
    ctaLabel: string;
    includes: string[];
  };
  trial: { title: string; body: string };
  faq: { h2: string; items: { question: string; answer: string }[] };
  finalCta: { h2: string; body: string; ctaLabel: string };
}
