import type { CalculatorLabels } from "@/components/tools/FoodCostCalculator";
import type { ToolPageContent } from "@/components/tools/ToolPageLayout";

export const calculatorLabelsEn: CalculatorLabels = {
  ingredient: "Ingredient",
  price: "Price",
  purchaseQty: "Bought",
  useQty: "Used",
  yieldPct: "Yield %",
  addRow: "Add ingredient",
  remove: "Remove",
  settings: "Settings",
  currency: "Currency",
  portions: "Portions",
  targetFc: "Target FC %",
  menuPrice: "Menu price",
  results: "Results",
  totalCost: "Total recipe cost",
  costPerPortion: "Cost per portion",
  foodCost: "Food cost %",
  suggestedPrice: "Suggested price",
  margin: "Gross margin",
  status: "Status",
  downloadPdf: "Download PDF",
  trialCta: "Save this recipe — start your free trial",
  statusGreen: "On target",
  statusOrange: "Watch",
  statusRed: "Over target",
  statusNoPrice: "Add prices",
};

export const calculatorContentEn: ToolPageContent = {
  hero: {
    h1: "Free food cost calculator",
    trustLine: "Free · No signup · EN & FR",
    intro:
      "Add your ingredients, their purchase prices and the quantities you actually use, and instantly see the cost per portion, food cost percentage, suggested menu price and gross margin of any dish. Works in CAD, USD, EUR and GBP, converts buy units to use units automatically, and exports a clean PDF.",
  },
  definition:
    "Food cost is the total cost of the ingredients used to make a dish, expressed as a percentage of its menu price. A food cost calculator divides recipe cost by selling price so operators can price dishes, protect margins and spot unprofitable items before they erode profit.",
  stats: [
    { label: "Currencies supported", value: "4" },
    { label: "Ideal food cost range", value: "28–35%" },
    { label: "Cost to use", value: "Free" },
    { label: "Languages", value: "EN · FR" },
  ],
  features: [
    { title: "Dish costing", body: "Cost any recipe from raw ingredient prices, with automatic buy-unit to use-unit conversion (kg → g, L → ml, case → each)." },
    { title: "Price recommendation", body: "Enter a target food cost percentage and get the suggested menu price that hits your margin goal on every dish." },
    { title: "Margin protection", body: "See gross margin in dollars and a green / watch / over-target status so you know which dishes need a price or portion fix." },
    { title: "PDF report", body: "Export a clean, printable summary of your costed recipe — no account required — to share with partners or your accountant." },
    { title: "Unit conversion", body: "Buy in kilograms or litres, use in grams or millilitres. The calculator normalizes everything to base units for you." },
    { title: "Multi-currency", body: "Switch between CAD, USD, EUR and GBP. Food cost math is currency-agnostic, so results are always accurate." },
  ],
  howTo: {
    title: "How to calculate food cost in 4 steps",
    steps: [
      { name: "Add ingredients", text: "List each ingredient, its purchase price and the amount you bought (e.g. a 5 kg case at $45)." },
      { name: "Enter quantities used", text: "For each ingredient, enter how much the recipe actually uses and, if relevant, the usable yield after trim loss." },
      { name: "Set portions & target", text: "Enter the number of portions the recipe yields and your target food cost percentage (30% is a common starting point)." },
      { name: "Read your numbers", text: "Instantly see cost per portion, food cost %, suggested price and margin. Add your menu price to check the actual FC%." },
    ],
  },
  formulas: {
    title: "The food cost formulas",
    items: [
      { name: "Food cost percentage", formula: "Food cost % = (Cost per portion ÷ Menu price) × 100", example: "A dish costing $3.00 sold at $10.00 → (3 ÷ 10) × 100 = 30% food cost." },
      { name: "Cost per portion", formula: "Cost per portion = Total recipe cost ÷ Portions", example: "A $12.00 recipe yielding 4 portions → 12 ÷ 4 = $3.00 per portion." },
      { name: "Suggested price", formula: "Suggested price = Cost per portion ÷ Target food cost %", example: "At a 30% target, a $3.00 portion → 3 ÷ 0.30 = $10.00 suggested price." },
      { name: "Gross margin", formula: "Gross margin = Menu price − Cost per portion", example: "A $10.00 dish costing $3.00 → $7.00 gross margin (70%)." },
    ],
  },
  benchmarks: {
    title: "Average food cost percentage by restaurant type",
    caption: "Working ranges compiled from industry benchmarks; verify against your own numbers. Last updated 2026.",
    columns: ["Restaurant type", "Typical food cost %"],
    rows: [
      { type: "Quick-service (QSR)", pct: 30, range: "28–32%" },
      { type: "Casual bistro", pct: 32, range: "30–35%" },
      { type: "Fine dining", pct: 36, range: "32–40%" },
      { type: "Pizzeria", pct: 25, range: "20–30%" },
      { type: "Café / bakery", pct: 30, range: "25–35%" },
      { type: "Bar (beverage)", pct: 20, range: "18–24%" },
    ],
  },
  audiences: {
    title: "Who uses this calculator",
    items: [
      "Independent restaurants",
      "Cafés & coffee shops",
      "Food trucks",
      "Caterers",
      "Private chefs",
      "Bakeries & pâtisseries",
      "Bars & cocktail programs",
      "Hospitality students",
    ],
  },
  faq: {
    title: "Food cost calculator FAQ",
    items: [
      { question: "What is a good food cost percentage?", answer: "Most restaurants aim for a food cost between 28% and 35%. Quick-service and pizzerias often run lower, fine dining a little higher. The right number depends on your concept, labour costs and pricing power." },
      { question: "How do I calculate food cost percentage?", answer: "Divide the cost of the ingredients in one portion by the dish's menu price, then multiply by 100. For example, a $3 plate cost on a $10 dish is a 30% food cost." },
      { question: "What is the difference between food cost and food cost percentage?", answer: "Food cost is the dollar amount of ingredients in a dish. Food cost percentage expresses that amount relative to the selling price, which is what you use to compare dishes and set prices." },
      { question: "Does the calculator handle unit conversions?", answer: "Yes. Buy an ingredient in kilograms or litres and use it in grams or millilitres — the calculator converts within the same measurement type automatically before costing." },
      { question: "What is yield or trim loss?", answer: "Yield is the usable percentage of an ingredient after peeling, trimming or cooking. A 90% yield means 10% is lost, so the cost of the usable portion rises accordingly." },
      { question: "Can I use this calculator for free?", answer: "Yes, the calculator is completely free with no signup and no ads. Create a free trial account only if you want to save recipes and track every dish over time." },
      { question: "Can I export my results?", answer: "Yes. Use the Download PDF button to save or print a clean summary of your costed recipe to share with partners or your accountant." },
      { question: "How is this different from a spreadsheet?", answer: "A spreadsheet cannot recalculate every recipe when a supplier price changes. The full FoodCost app propagates a price change across all affected dishes and alerts you when one crosses your target." },
    ],
  },
  finalCta: {
    title: "Save this recipe and track every dish",
    body: "The free calculator prices one dish. FoodCost by PixPlat saves your recipes, updates every cost when an ingredient price changes, and flags dishes that cross your target — for $12/mo, no demo call.",
    ctaLabel: "Start your 14-day free trial",
  },
};
