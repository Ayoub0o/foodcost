export interface VsSource {
  label: string;
  url: string;
  retrievedAt: string;
}

export interface VsRow {
  feature: string;
  foodcost: string;
  competitor: string;
}

export interface VsPage {
  slug: string;
  competitorName: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  definition: { en: string; fr: string };
  sources: VsSource[];
  rows: { en: VsRow[]; fr: VsRow[] };
  updatedAt: string;
}

const commonSources = (name: string, url: string): VsSource[] => [
  {
    label: `${name} pricing page`,
    url,
    retrievedAt: "2026-03-15",
  },
  {
    label: "FoodCost by PixPlat pricing",
    url: "https://pixplat.com/foodcost/en/pricing",
    retrievedAt: "2026-07-01",
  },
];

export const VS_PAGES: VsPage[] = [
  {
    slug: "meez",
    competitorName: "Meez",
    title: {
      en: "FoodCost vs Meez",
      fr: "FoodCost vs Meez",
    },
    description: {
      en: "Compare FoodCost and Meez on price, propagation, and self-serve trial.",
      fr: "Comparer FoodCost et Meez sur le prix, la propagation et l'essai self-serve.",
    },
    definition: {
      en: "Meez is a recipe and kitchen operations platform aimed at multi-unit teams. FoodCost is a $12/mo self-serve food cost tool for independents that recalculates every affected recipe when an ingredient price changes.",
      fr: "Meez est une plateforme recettes et opérations pour équipes multi-sites. FoodCost est un outil self-serve à 12 $/mois pour indépendants qui recalcule chaque recette touchée quand un prix d'ingrédient change.",
    },
    sources: commonSources("Meez", "https://www.getmeez.com/pricing"),
    updatedAt: "2026-07-01",
    rows: {
      en: [
        { feature: "Starting price", foodcost: "$12/mo", competitor: "Custom / sales-led (retr. 2026-03-15)" },
        { feature: "14-day trial without card", foodcost: "Yes", competitor: "Demo-led (retr. 2026-03-15)" },
        { feature: "Ingredient price → recipe propagation", foodcost: "Native + threshold alerts", competitor: "Recipe focus; confirm with vendor" },
        { feature: "Excel exports", foodcost: "Profitability, recipe book, catalog", competitor: "Varies by plan" },
        { feature: "Bilingual EN/FR", foodcost: "Full product + marketing", competitor: "Primarily EN" },
      ],
      fr: [
        { feature: "Prix de départ", foodcost: "12 $/mois", competitor: "Sur mesure / vente (rét. 2026-03-15)" },
        { feature: "Essai 14 jours sans carte", foodcost: "Oui", competitor: "Via démo (rét. 2026-03-15)" },
        { feature: "Propagation prix → recettes", foodcost: "Native + alertes de seuil", competitor: "Focus recettes ; à confirmer" },
        { feature: "Exports Excel", foodcost: "Rentabilité, livre, catalogue", competitor: "Selon forfait" },
        { feature: "Bilingue EN/FR", foodcost: "Produit + marketing", competitor: "Surtout EN" },
      ],
    },
  },
  {
    slug: "marketman",
    competitorName: "MarketMan",
    title: { en: "FoodCost vs MarketMan", fr: "FoodCost vs MarketMan" },
    description: {
      en: "FoodCost vs MarketMan for independents who need costing without a full inventory suite.",
      fr: "FoodCost vs MarketMan pour indépendants qui veulent coster sans suite inventaire complète.",
    },
    definition: {
      en: "MarketMan is an inventory and purchasing platform for restaurants. FoodCost focuses on recipe costing, live food cost %, and propagation alerts at a transparent $12/mo.",
      fr: "MarketMan est une plateforme inventaire et achats. FoodCost se concentre sur le costing de recettes, le food cost % live et les alertes de propagation à 12 $/mois.",
    },
    sources: commonSources("MarketMan", "https://www.marketman.com/pricing"),
    updatedAt: "2026-07-01",
    rows: {
      en: [
        { feature: "Starting price", foodcost: "$12/mo", competitor: "Tiered / quote (retr. 2026-03-15)" },
        { feature: "Core job", foodcost: "Recipe costing + alerts", competitor: "Inventory + purchasing" },
        { feature: "Setup time", foodcost: "<15 minutes to first FC%", competitor: "Broader ops rollout" },
        { feature: "Propagation alerts", foodcost: "Yes", competitor: "Inventory variance workflows" },
        { feature: "Self-serve signup", foodcost: "Yes", competitor: "Often sales-assisted" },
      ],
      fr: [
        { feature: "Prix de départ", foodcost: "12 $/mois", competitor: "Paliers / devis (rét. 2026-03-15)" },
        { feature: "Cœur de produit", foodcost: "Costing + alertes", competitor: "Inventaire + achats" },
        { feature: "Temps de prise en main", foodcost: "<15 min jusqu'au 1er FC%", competitor: "Déploiement ops plus large" },
        { feature: "Alertes de propagation", foodcost: "Oui", competitor: "Écarts d'inventaire" },
        { feature: "Inscription self-serve", foodcost: "Oui", competitor: "Souvent assistée" },
      ],
    },
  },
  {
    slug: "apicbase",
    competitorName: "Apicbase",
    title: { en: "FoodCost vs Apicbase", fr: "FoodCost vs Apicbase" },
    description: {
      en: "Where FoodCost fits versus Apicbase for recipe and food cost management.",
      fr: "Où se place FoodCost face à Apicbase pour le costing et les recettes.",
    },
    definition: {
      en: "Apicbase is an enterprise food management suite. FoodCost is a focused micro-SaaS for independents who need accurate food cost % and price-change alerts without a long implementation.",
      fr: "Apicbase est une suite enterprise de food management. FoodCost est un micro-SaaS pour indépendants qui veulent un food cost % fiable et des alertes de prix sans long déploiement.",
    },
    sources: commonSources("Apicbase", "https://apicbase.com/pricing/"),
    updatedAt: "2026-07-01",
    rows: {
      en: [
        { feature: "Starting price", foodcost: "$12/mo", competitor: "Enterprise quote (retr. 2026-03-15)" },
        { feature: "Implementation", foodcost: "Self-serve", competitor: "Project-style" },
        { feature: "Best for", foodcost: "Independents & small groups", competitor: "Larger multi-unit" },
        { feature: "Threshold alerts on FC%", foodcost: "Built-in", competitor: "Configurable in suite" },
        { feature: "Bilingual CA market", foodcost: "EN + FR first-class", competitor: "Multi-language suite" },
      ],
      fr: [
        { feature: "Prix de départ", foodcost: "12 $/mois", competitor: "Devis enterprise (rét. 2026-03-15)" },
        { feature: "Mise en place", foodcost: "Self-serve", competitor: "Mode projet" },
        { feature: "Idéal pour", foodcost: "Indépendants & petits groupes", competitor: "Multi-sites plus larges" },
        { feature: "Alertes de seuil FC%", foodcost: "Natif", competitor: "Configurable dans la suite" },
        { feature: "Marché CA bilingue", foodcost: "EN + FR natifs", competitor: "Suite multilingue" },
      ],
    },
  },
  {
    slug: "octogone",
    competitorName: "Octogone",
    title: { en: "FoodCost vs Octogone", fr: "FoodCost vs Octogone" },
    description: {
      en: "FoodCost compared with Octogone for Quebec and Canadian independents.",
      fr: "FoodCost comparé à Octogone pour les indépendants du Québec et du Canada.",
    },
    definition: {
      en: "Octogone is a Canadian restaurant management suite spanning inventory and ops. FoodCost is the lightweight costing layer: $12/mo, bilingual, with instant propagation when supplier prices move.",
      fr: "Octogone est une suite canadienne de gestion restaurant (inventaire et ops). FoodCost est la couche costing légère : 12 $/mois, bilingue, avec propagation instantanée quand les prix fournisseurs bougent.",
    },
    sources: commonSources("Octogone", "https://octogone.app/"),
    updatedAt: "2026-07-01",
    rows: {
      en: [
        { feature: "Starting price", foodcost: "$12/mo", competitor: "Suite pricing (retr. 2026-03-15)" },
        { feature: "Focus", foodcost: "Food cost & recipes", competitor: "Broader restaurant ops" },
        { feature: "FR product UX", foodcost: "Full", competitor: "Strong CA presence" },
        { feature: "Propagation differentiator", foodcost: "Core feature", competitor: "Part of wider modules" },
        { feature: "Trial", foodcost: "14 days, no card", competitor: "Contact sales / site" },
      ],
      fr: [
        { feature: "Prix de départ", foodcost: "12 $/mois", competitor: "Tarification suite (rét. 2026-03-15)" },
        { feature: "Focus", foodcost: "Food cost & recettes", competitor: "Ops restaurant plus larges" },
        { feature: "UX produit FR", foodcost: "Complète", competitor: "Forte présence CA" },
        { feature: "Différenciateur propagation", foodcost: "Fonction centrale", competitor: "Parmi d'autres modules" },
        { feature: "Essai", foodcost: "14 jours, sans carte", competitor: "Contact / site" },
      ],
    },
  },
];

export function getVsPage(slug: string): VsPage | undefined {
  return VS_PAGES.find((p) => p.slug === slug);
}
