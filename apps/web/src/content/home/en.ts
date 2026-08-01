import type { HomeContent } from "./types";
import { calculatorContentEn } from "@/content/calculator/en";

export const homeContentEn: HomeContent = {
  hero: {
    h1: "Food cost software for independent restaurants",
    subtitle:
      "Recipe costing, live margins, and clean Excel exports — know the real cost and food cost percentage of every dish in 15 minutes. No POS. No demo call.",
    ctaPrimary: "Start your 14-day free trial",
    ctaSecondary: "Try the free calculator",
    trust: "$12/mo — no demo, cancel anytime",
  },
  stats: [
    { label: "To your first food cost %", value: "< 15 min" },
    { label: "Monthly price", value: "$12" },
    { label: "Recipes & ingredients", value: "Unlimited" },
    { label: "Demo call required", value: "Never" },
  ],
  problem: {
    h2: "Your Excel food cost sheet is 18 months old",
    paragraphs: [
      "Most independent restaurants cost their menu in a spreadsheet that was last updated a year and a half ago. Supplier prices drift silently, portions creep, and margins shrink a few points every year without anyone noticing which dishes are the problem.",
      "FoodCost replaces that fragile spreadsheet with live recipe costing. Import your ingredients, build your fiches techniques once, and every dish stays accurate as prices move — with cleaner exports than your own spreadsheet ever produced.",
    ],
    linkLabel: "See the recipe costing template",
  },
  features: {
    h2: "Everything you need to control food cost",
    blocks: [
      { title: "Recipe costing & fiches techniques", body: "Build costed recipes with sub-recipes, yield/trim loss, allergens and photos. Get cost per portion, suggested price and margin on every dish." },
      { title: "Instant cost propagation & alerts", body: "Change one ingredient price and every affected recipe recalculates instantly — with an alert when a dish crosses your target food cost. The reason to leave Excel." },
      { title: "Profitability dashboard", body: "Rank every dish by margin and food cost %, spot your least profitable items, and see menu-wide averages at a glance." },
      { title: "Excel & PDF exports", body: "One-click profitability reports, a full recipe book, and printable technical sheets — formatted and ready for your accountant." },
    ],
  },
  miniCalc: {
    h2: "Try it now — cost a dish in seconds",
    body: "Add a few ingredients below to see the cost per portion, food cost percentage and suggested price. It's the same engine that powers the full product.",
    openLabel: "Open the full calculator",
  },
  how: {
    h2: "How it works",
    steps: [
      { name: "Add your ingredients", text: "Enter or import your ingredients with purchase prices and units. Start from a 300-item starter library if you like." },
      { name: "Build your recipes", text: "Compose dishes from ingredients and sub-recipes with quantities. Costs compute live as you type." },
      { name: "Watch your margins", text: "See food cost %, margin and status for every dish — and get alerted the moment a price change pushes one over target." },
    ],
  },
  comparison: {
    h2: "Affordable, self-serve, bilingual",
    columns: ["", "Price", "Self-serve signup", "FR + EN", "Built for 1 location"],
    rows: [
      { name: "FoodCost by PixPlat", price: "$12/mo (public)", selfServe: "Yes", frSupport: "Yes", singleLocation: "Yes", highlight: true },
      { name: "meez", price: "Not public — demo required", selfServe: "No", frSupport: "EN only", singleLocation: "Group-focused" },
      { name: "Octogone", price: "Not public — demo required", selfServe: "No", frSupport: "FR + EN", singleLocation: "Ops suite" },
      { name: "MarketMan", price: "Public (varies) — inventory-led", selfServe: "Partial", frSupport: "EN", singleLocation: "Chains" },
    ],
    sourceNote:
      "Competitor pricing is shown as published where public, or labelled “not public — demo required” where it is not. Re-verified quarterly; last checked 2026.",
  },
  benchmarks: {
    h2: "Average food cost percentage by restaurant type",
    columns: ["Restaurant type", "Typical food cost %"],
    rows: calculatorContentEn.benchmarks.rows,
    caption: "Working ranges from industry benchmarks — verify against your own numbers. Last updated 2026.",
  },
  testimonials: {
    h2: "Built with independent operators",
    note: "We publish testimonials only from real beta users. Reviews will appear here as our first restaurants share their results.",
  },
  faq: {
    h2: "Frequently asked questions",
    items: calculatorContentEn.faq.items,
  },
  resources: {
    h2: "Resources & tools",
    cards: [
      { title: "Free food cost calculator", body: "Cost a dish, get the food cost % and suggested price — no signup.", href: "/calculator" },
      { title: "Pricing", body: "One plan, $12/mo, 14-day free trial. See what's included.", href: "/pricing" },
      { title: "Recipe costing, explained", body: "Learn the formulas and how instant propagation protects your margin.", href: "/calculator" },
    ],
  },
  finalCta: {
    h2: "Know the real margin of every dish",
    body: "Start your 14-day free trial — full features, no credit card required, and your data is always exportable. $12/mo after that, cancel anytime.",
    ctaLabel: "Start your free trial",
  },
};
