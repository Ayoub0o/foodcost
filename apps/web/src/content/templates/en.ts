import type { TemplatesContent } from "./types";

export const templatesContentEn: TemplatesContent = {
  hero: {
    h1: "Free food cost templates for restaurants",
    subtitle:
      "Ready-to-use spreadsheets to cost a recipe and track your menu's food cost percentage. Enter your email and download them instantly — then upgrade to FoodCost when the spreadsheet gets painful.",
  },
  definition:
    "These free food cost templates are spreadsheets (CSV, open in Excel or Google Sheets) that calculate the cost of a recipe from purchase prices, yields and portion sizes, and track the food cost percentage of every dish on your menu against a target.",
  downloads: [
    {
      title: "Recipe costing template",
      description:
        "Break a dish down ingredient by ingredient: purchase price, quantity used, yield, and automatic cost per portion and food cost %.",
      file: "recipe-costing-template.csv",
      format: "CSV · Excel / Google Sheets",
    },
    {
      title: "Menu food cost tracker",
      description:
        "List every dish with its cost, selling price and food cost %, and see your menu average at a glance against your target.",
      file: "menu-food-cost-tracker.csv",
      format: "CSV · Excel / Google Sheets",
    },
  ],
  form: {
    heading: "Get the templates",
    emailLabel: "Work email",
    emailPlaceholder: "you@restaurant.com",
    submitLabel: "Send me the templates",
    consent:
      "We'll email you the download links and occasional food-costing tips. Unsubscribe anytime.",
    error: "Something went wrong. Please try again.",
    invalidEmail: "Please enter a valid email address.",
  },
  unlocked: {
    title: "Your templates are ready",
    body: "Thanks! Download the files below. We've also sent the links to your inbox.",
    downloadLabel: "Download",
  },
  faq: {
    h2: "Frequently asked questions",
    items: [
      { question: "Are these templates really free?", answer: "Yes. Enter your email and download both templates at no cost. They're yours to keep and edit." },
      { question: "What format are they in?", answer: "They're CSV files that open directly in Microsoft Excel, Google Sheets, Numbers or LibreOffice." },
      { question: "When should I move off a spreadsheet?", answer: "Spreadsheets break down once you have many recipes and shared ingredients: change one supplier price and you must hunt down every dish by hand. FoodCost propagates that change instantly and flags dishes that cross your margin target." },
      { question: "Do you store my email?", answer: "We store your email to send the download links and occasional tips. You can unsubscribe at any time, and we never sell your data." },
    ],
  },
  finalCta: {
    h2: "Outgrowing the spreadsheet?",
    body: "FoodCost turns these templates into a live system: unlimited recipes, instant price propagation and margin alerts. Try it free for 14 days.",
    ctaLabel: "Start your free trial",
  },
};
