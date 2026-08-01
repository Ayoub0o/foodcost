import type { PricingContent } from "./types";

export const pricingContentEn: PricingContent = {
  hero: {
    h1: "Simple, transparent pricing",
    subtitle:
      "One plan. Everything included. $12/mo or $120/yr — a 14-day full-featured free trial, no credit card required, and your data is always exportable.",
  },
  definition:
    "FoodCost by PixPlat costs $12 per month (or $120 per year) for unlimited recipes and ingredients, the instant cost-propagation engine, threshold alerts, Excel and PDF exports, and price history — with a 14-day free trial and no demo call.",
  plan: {
    name: "Pro",
    price: "$12",
    period: "/month",
    yearlyNote: "or $120/year — save two months",
    ctaLabel: "Start your 14-day free trial",
    includes: [
      "Unlimited recipes & ingredients",
      "Instant cost-propagation engine",
      "Threshold alerts on every dish",
      "Profitability dashboard",
      "Excel & PDF exports",
      "Ingredient price history",
      "Printable technical sheets",
      "Bilingual EN / FR",
    ],
  },
  trial: {
    title: "14-day free trial, then $12/mo",
    body: "Try every feature free for 14 days. No credit card required to start. When the trial ends, your workspace becomes read-only — but you can always export all of your data. We never hold your data hostage.",
  },
  faq: {
    h2: "Billing questions",
    items: [
      { question: "Is there a free plan?", answer: "There's no free tier, but the food cost calculator is permanently free and you get a full 14-day trial of everything. That's usually enough to cost your whole menu." },
      { question: "Do I need a credit card to start?", answer: "No. You can start the 14-day trial without a card and only add payment when you decide to continue." },
      { question: "What happens when my trial ends?", answer: "Your workspace switches to read-only. Your recipes and data stay intact and fully exportable; you simply can't make edits until you subscribe." },
      { question: "Can I cancel anytime?", answer: "Yes. Cancel from the billing portal at any time. You keep access until the end of the paid period, and you can still export your data afterwards." },
      { question: "Is there an annual discount?", answer: "Yes. Paying yearly ($120) is the equivalent of getting two months free versus the monthly price." },
      { question: "Which currencies can I use?", answer: "Workspaces support CAD, USD and EUR, and the free calculator also handles GBP. Costing math is currency-agnostic, so results are always accurate." },
    ],
  },
  finalCta: {
    h2: "Start costing your menu today",
    body: "14 days free, full features, no credit card. Know the real margin of every dish in 15 minutes.",
    ctaLabel: "Start your free trial",
  },
};
