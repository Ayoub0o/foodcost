import type { CalculatorLabels } from "@/components/tools/FoodCostCalculator";
import type { ToolPageContent } from "@/components/tools/ToolPageLayout";

export const calculatorLabelsFr: CalculatorLabels = {
  ingredient: "Ingrédient",
  price: "Prix",
  purchaseQty: "Acheté",
  useQty: "Utilisé",
  yieldPct: "Rendement %",
  addRow: "Ajouter un ingrédient",
  remove: "Retirer",
  settings: "Paramètres",
  currency: "Devise",
  portions: "Portions",
  targetFc: "Coût matière cible %",
  menuPrice: "Prix de vente",
  results: "Résultats",
  totalCost: "Coût total de la recette",
  costPerPortion: "Coût par portion",
  foodCost: "Coût matière %",
  suggestedPrice: "Prix suggéré",
  margin: "Marge brute",
  status: "Statut",
  downloadPdf: "Télécharger le PDF",
  trialCta: "Enregistrer cette recette — essai gratuit",
  statusGreen: "Dans la cible",
  statusOrange: "À surveiller",
  statusRed: "Au-dessus de la cible",
  statusNoPrice: "Ajoutez des prix",
};

export const calculatorContentFr: ToolPageContent = {
  hero: {
    h1: "Calculateur de coût matière gratuit",
    trustLine: "Gratuit · Sans inscription · FR & EN",
    intro:
      "Ajoutez vos ingrédients, leurs prix d'achat et les quantités réellement utilisées, puis obtenez instantanément le coût par portion, le pourcentage de coût matière, le prix de vente suggéré et la marge brute de chaque plat. Fonctionne en CAD, USD, EUR et GBP, convertit automatiquement les unités d'achat en unités d'utilisation et exporte un PDF soigné.",
  },
  definition:
    "Le coût matière est le coût total des ingrédients d'un plat, exprimé en pourcentage de son prix de vente. Un calculateur de coût matière divise le coût de la recette par le prix de vente afin de fixer les prix, protéger les marges et repérer les plats non rentables avant qu'ils n'érodent le profit.",
  stats: [
    { label: "Devises prises en charge", value: "4" },
    { label: "Coût matière idéal", value: "28–35 %" },
    { label: "Prix d'utilisation", value: "Gratuit" },
    { label: "Langues", value: "FR · EN" },
  ],
  features: [
    { title: "Coût de revient du plat", body: "Calculez le coût de toute recette à partir des prix d'achat, avec conversion automatique unité d'achat → unité d'utilisation (kg → g, L → ml, caisse → pièce)." },
    { title: "Prix recommandé", body: "Saisissez un coût matière cible et obtenez le prix de vente suggéré qui atteint votre objectif de marge sur chaque plat." },
    { title: "Protection de la marge", body: "Voyez la marge brute en dollars et un statut cible / surveillance / dépassement pour savoir quels plats corriger." },
    { title: "Rapport PDF", body: "Exportez un résumé imprimable de votre recette costée — sans compte — à partager avec vos associés ou votre comptable." },
    { title: "Conversion d'unités", body: "Achetez en kilogrammes ou en litres, utilisez en grammes ou en millilitres. Le calculateur normalise tout en unités de base." },
    { title: "Multidevise", body: "Basculez entre CAD, USD, EUR et GBP. Le calcul du coût matière est indépendant de la devise, les résultats restent exacts." },
  ],
  howTo: {
    title: "Comment calculer son coût matière en 4 étapes",
    steps: [
      { name: "Ajouter les ingrédients", text: "Listez chaque ingrédient, son prix d'achat et la quantité achetée (ex. une caisse de 5 kg à 45 $)." },
      { name: "Saisir les quantités utilisées", text: "Pour chaque ingrédient, indiquez la quantité réellement utilisée et, au besoin, le rendement après perte de coupe." },
      { name: "Définir portions et cible", text: "Indiquez le nombre de portions de la recette et votre coût matière cible (30 % est un point de départ courant)." },
      { name: "Lire vos chiffres", text: "Obtenez le coût par portion, le coût matière %, le prix suggéré et la marge. Ajoutez votre prix de vente pour vérifier le coût matière réel." },
    ],
  },
  formulas: {
    title: "Les formules du coût matière",
    items: [
      { name: "Pourcentage de coût matière", formula: "Coût matière % = (Coût par portion ÷ Prix de vente) × 100", example: "Un plat coûtant 3,00 $ vendu 10,00 $ → (3 ÷ 10) × 100 = 30 % de coût matière." },
      { name: "Coût par portion", formula: "Coût par portion = Coût total de la recette ÷ Portions", example: "Une recette à 12,00 $ pour 4 portions → 12 ÷ 4 = 3,00 $ par portion." },
      { name: "Prix suggéré", formula: "Prix suggéré = Coût par portion ÷ Coût matière cible %", example: "Avec une cible de 30 %, une portion à 3,00 $ → 3 ÷ 0,30 = 10,00 $ suggéré." },
      { name: "Marge brute", formula: "Marge brute = Prix de vente − Coût par portion", example: "Un plat à 10,00 $ coûtant 3,00 $ → 7,00 $ de marge brute (70 %)." },
    ],
  },
  benchmarks: {
    title: "Coût matière moyen par type de restaurant",
    caption: "Fourchettes indicatives issues de références sectorielles ; validez avec vos propres chiffres. Mise à jour 2026.",
    columns: ["Type de restaurant", "Coût matière typique %"],
    rows: [
      { type: "Restauration rapide", pct: 30, range: "28–32 %" },
      { type: "Bistro décontracté", pct: 32, range: "30–35 %" },
      { type: "Gastronomique", pct: 36, range: "32–40 %" },
      { type: "Pizzeria", pct: 25, range: "20–30 %" },
      { type: "Café / boulangerie", pct: 30, range: "25–35 %" },
      { type: "Bar (boissons)", pct: 20, range: "18–24 %" },
    ],
  },
  audiences: {
    title: "Qui utilise ce calculateur",
    items: [
      "Restaurants indépendants",
      "Cafés",
      "Camions de rue",
      "Traiteurs",
      "Chefs privés",
      "Boulangeries & pâtisseries",
      "Bars & cocktails",
      "Étudiants en hôtellerie",
    ],
  },
  faq: {
    title: "FAQ du calculateur de coût matière",
    items: [
      { question: "Quel est un bon pourcentage de coût matière ?", answer: "La plupart des restaurants visent un coût matière entre 28 % et 35 %. La restauration rapide et les pizzerias sont souvent plus bas, la gastronomie un peu plus haut. Le bon chiffre dépend de votre concept et de vos coûts." },
      { question: "Comment calculer le pourcentage de coût matière ?", answer: "Divisez le coût des ingrédients d'une portion par le prix de vente du plat, puis multipliez par 100. Par exemple, un coût de 3 $ sur un plat à 10 $ donne 30 % de coût matière." },
      { question: "Quelle différence entre coût matière et pourcentage de coût matière ?", answer: "Le coût matière est le montant en dollars des ingrédients d'un plat. Le pourcentage exprime ce montant par rapport au prix de vente, ce qui sert à comparer les plats et fixer les prix." },
      { question: "Le calculateur gère-t-il les conversions d'unités ?", answer: "Oui. Achetez un ingrédient en kilogrammes ou en litres et utilisez-le en grammes ou en millilitres — le calculateur convertit automatiquement au sein d'une même unité de mesure." },
      { question: "Qu'est-ce que le rendement ou la perte de coupe ?", answer: "Le rendement est le pourcentage utilisable d'un ingrédient après épluchage, parage ou cuisson. Un rendement de 90 % signifie 10 % de perte, donc le coût de la portion utilisable augmente." },
      { question: "Le calculateur est-il gratuit ?", answer: "Oui, le calculateur est entièrement gratuit, sans inscription et sans publicité. Créez un compte d'essai uniquement si vous souhaitez enregistrer des recettes et suivre chaque plat dans le temps." },
      { question: "Puis-je exporter mes résultats ?", answer: "Oui. Utilisez le bouton Télécharger le PDF pour enregistrer ou imprimer un résumé soigné de votre recette costée à partager avec vos associés ou votre comptable." },
      { question: "En quoi est-ce différent d'un tableur ?", answer: "Un tableur ne peut pas recalculer toutes les recettes quand un prix fournisseur change. L'application FoodCost propage un changement de prix sur tous les plats concernés et vous alerte quand l'un dépasse votre cible." },
    ],
  },
  finalCta: {
    title: "Enregistrez cette recette et suivez chaque plat",
    body: "Le calculateur gratuit coste un plat. FoodCost by PixPlat enregistre vos recettes, met à jour chaque coût quand un prix d'ingrédient change et signale les plats qui dépassent votre cible — pour 12 $/mois, sans rendez-vous commercial.",
    ctaLabel: "Démarrer l'essai gratuit de 14 jours",
  },
};
