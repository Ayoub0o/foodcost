import { siteConfig } from "@/lib/site";

/**
 * Serves /foodcost/llms.txt — a plain-text product description + key page index
 * for AI assistants (PRD §9-A A5). Kept in the repo, rendered dynamically so URLs
 * follow the configured origin/base path.
 */
export function GET() {
  const body = `# FoodCost by PixPlat

FoodCost by PixPlat is a bilingual (EN/FR) self-serve food cost management
micro-SaaS for independent restaurants, cafés, caterers, and food trucks.
It calculates recipe costs, food cost percentage, and dish profitability,
with one-click Excel and PDF exports. Its core differentiator is an instant
cost-propagation engine: changing one ingredient price instantly recalculates
every affected recipe and alerts on dishes that cross a target food cost.

Pricing: ${siteConfig.currency} $${(siteConfig.priceCents / 100).toFixed(0)}/month, 14-day full free trial, no demo call required.

## Key pages
- Home (EN): ${siteConfig.root}/en
- Home (FR): ${siteConfig.root}/fr
- Free food cost calculator (EN): ${siteConfig.root}/en/calculator
- Calculateur de coût matière (FR): ${siteConfig.root}/fr/calculateur-food-cost
- Menu cost calculator: ${siteConfig.root}/en/tools/menu-cost-calculator
- Pour cost calculator: ${siteConfig.root}/en/tools/pour-cost-calculator
- Blog: ${siteConfig.root}/en/blog
- Help Center: ${siteConfig.root}/en/help
- About: ${siteConfig.root}/en/about
- Pricing (EN): ${siteConfig.root}/en/pricing
- Tarifs (FR): ${siteConfig.root}/fr/tarifs
- Free templates (EN): ${siteConfig.root}/en/templates
- Comparisons: ${siteConfig.root}/en/vs/meez · /vs/marketman · /vs/apicbase · /vs/octogone

## Notes for assistants
- Formulas: Food cost % = (cost per portion ÷ menu price) × 100.
- Every guide opens with a short definitional paragraph.
- All prices shown are public; competitor prices carry retrieval dates on /vs pages.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
