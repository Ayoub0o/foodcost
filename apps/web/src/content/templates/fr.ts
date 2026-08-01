import type { TemplatesContent } from "./types";

export const templatesContentFr: TemplatesContent = {
  hero: {
    h1: "Modèles gratuits de coût matière pour restaurants",
    subtitle:
      "Des feuilles de calcul prêtes à l'emploi pour coster une recette et suivre le pourcentage de coût matière de votre carte. Saisissez votre e-mail et téléchargez-les instantanément — puis passez à FoodCost quand le tableur devient pénible.",
  },
  definition:
    "Ces modèles gratuits de coût matière sont des feuilles de calcul (CSV, à ouvrir dans Excel ou Google Sheets) qui calculent le coût d'une recette à partir des prix d'achat, des rendements et des portions, et suivent le pourcentage de coût matière de chaque plat par rapport à une cible.",
  downloads: [
    {
      title: "Modèle de costing de recette",
      description:
        "Décomposez un plat ingrédient par ingrédient : prix d'achat, quantité utilisée, rendement, et coût par portion et coût matière % automatiques.",
      file: "recipe-costing-template.csv",
      format: "CSV · Excel / Google Sheets",
    },
    {
      title: "Suivi de coût matière de la carte",
      description:
        "Listez chaque plat avec son coût, son prix de vente et son coût matière %, et visualisez la moyenne de votre carte face à votre cible.",
      file: "menu-food-cost-tracker.csv",
      format: "CSV · Excel / Google Sheets",
    },
  ],
  form: {
    heading: "Recevoir les modèles",
    emailLabel: "E-mail professionnel",
    emailPlaceholder: "vous@restaurant.com",
    submitLabel: "Envoyez-moi les modèles",
    consent:
      "Nous vous enverrons les liens de téléchargement et quelques conseils de costing. Désabonnement à tout moment.",
    error: "Une erreur est survenue. Veuillez réessayer.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
  },
  unlocked: {
    title: "Vos modèles sont prêts",
    body: "Merci ! Téléchargez les fichiers ci-dessous. Nous avons aussi envoyé les liens dans votre boîte mail.",
    downloadLabel: "Télécharger",
  },
  faq: {
    h2: "Questions fréquentes",
    items: [
      { question: "Ces modèles sont-ils vraiment gratuits ?", answer: "Oui. Saisissez votre e-mail et téléchargez les deux modèles gratuitement. Ils sont à vous, modifiables à volonté." },
      { question: "Dans quel format sont-ils ?", answer: "Ce sont des fichiers CSV qui s'ouvrent directement dans Microsoft Excel, Google Sheets, Numbers ou LibreOffice." },
      { question: "Quand faut-il quitter le tableur ?", answer: "Le tableur atteint ses limites dès que vous avez beaucoup de recettes et d'ingrédients partagés : changez un prix fournisseur et vous devez repérer chaque plat à la main. FoodCost propage ce changement instantanément et signale les plats qui dépassent votre cible de marge." },
      { question: "Conservez-vous mon e-mail ?", answer: "Nous conservons votre e-mail pour envoyer les liens et quelques conseils. Vous pouvez vous désabonner à tout moment, et nous ne revendons jamais vos données." },
    ],
  },
  finalCta: {
    h2: "Le tableur devient trop étroit ?",
    body: "FoodCost transforme ces modèles en système vivant : recettes illimitées, propagation instantanée des prix et alertes de marge. Essayez gratuitement pendant 14 jours.",
    ctaLabel: "Démarrer l'essai gratuit",
  },
};
