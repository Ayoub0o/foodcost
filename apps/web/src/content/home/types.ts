import type { BenchmarkRow } from "@/components/tools/BenchmarkInfographic";

export interface ComparisonRow {
  name: string;
  price: string;
  selfServe: string;
  frSupport: string;
  singleLocation: string;
  highlight?: boolean;
}

export interface HomeContent {
  hero: { h1: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; trust: string };
  stats: { label: string; value: string }[];
  problem: { h2: string; paragraphs: string[]; linkLabel: string };
  features: { h2: string; blocks: { title: string; body: string }[] };
  miniCalc: { h2: string; body: string; openLabel: string };
  how: { h2: string; steps: { name: string; text: string }[] };
  comparison: {
    h2: string;
    columns: [string, string, string, string, string];
    rows: ComparisonRow[];
    sourceNote: string;
  };
  benchmarks: { h2: string; columns: [string, string]; rows: BenchmarkRow[]; caption: string };
  testimonials: { h2: string; note: string };
  faq: { h2: string; items: { question: string; answer: string }[] };
  resources: { h2: string; cards: { title: string; body: string; href: "/calculator" | "/pricing" }[] };
  finalCta: { h2: string; body: string; ctaLabel: string };
}
