import type { PricingContent } from "./types";

export const pricingContentFr: PricingContent = {
  hero: {
    h1: "Tarifs simples et transparents",
    subtitle:
      "Un seul forfait. Tout inclus. 12 $/mois ou 120 $/an — essai gratuit complet de 14 jours, sans carte de crédit, et vos données toujours exportables.",
  },
  definition:
    "FoodCost by PixPlat coûte 12 $ par mois (ou 120 $ par an) pour des recettes et ingrédients illimités, le moteur de propagation instantanée des coûts, les alertes de seuil, les exports Excel et PDF, et l'historique des prix — avec un essai gratuit de 14 jours et sans rendez-vous commercial.",
  plan: {
    name: "Pro",
    price: "12 $",
    period: "/mois",
    yearlyNote: "ou 120 $/an — deux mois offerts",
    ctaLabel: "Démarrer l'essai gratuit de 14 jours",
    includes: [
      "Recettes & ingrédients illimités",
      "Moteur de propagation instantanée",
      "Alertes de seuil sur chaque plat",
      "Tableau de rentabilité",
      "Exports Excel & PDF",
      "Historique des prix d'ingrédients",
      "Fiches techniques imprimables",
      "Bilingue FR / EN",
    ],
  },
  trial: {
    title: "14 jours d'essai gratuit, puis 12 $/mois",
    body: "Essayez toutes les fonctionnalités gratuitement pendant 14 jours. Aucune carte de crédit pour commencer. À la fin de l'essai, votre espace passe en lecture seule — mais vous pouvez toujours exporter toutes vos données. Nous ne retenons jamais vos données en otage.",
  },
  faq: {
    h2: "Questions de facturation",
    items: [
      { question: "Existe-t-il un forfait gratuit ?", answer: "Il n'y a pas de palier gratuit, mais le calculateur de coût matière est gratuit en permanence et vous bénéficiez d'un essai complet de 14 jours. C'est généralement suffisant pour coster toute votre carte." },
      { question: "Faut-il une carte de crédit pour commencer ?", answer: "Non. Vous pouvez démarrer l'essai de 14 jours sans carte et n'ajouter un moyen de paiement qu'au moment de continuer." },
      { question: "Que se passe-t-il à la fin de l'essai ?", answer: "Votre espace passe en lecture seule. Vos recettes et données restent intactes et entièrement exportables ; vous ne pouvez simplement plus les modifier avant de vous abonner." },
      { question: "Puis-je annuler à tout moment ?", answer: "Oui. Annulez depuis le portail de facturation quand vous voulez. Vous gardez l'accès jusqu'à la fin de la période payée et pouvez toujours exporter vos données ensuite." },
      { question: "Y a-t-il une remise annuelle ?", answer: "Oui. Le paiement annuel (120 $) équivaut à deux mois offerts par rapport au tarif mensuel." },
      { question: "Quelles devises puis-je utiliser ?", answer: "Les espaces prennent en charge CAD, USD et EUR, et le calculateur gratuit gère aussi la GBP. Le calcul est indépendant de la devise, les résultats restent exacts." },
    ],
  },
  finalCta: {
    h2: "Commencez à coster votre carte aujourd'hui",
    body: "14 jours gratuits, toutes les fonctionnalités, sans carte de crédit. Connaissez la marge réelle de chaque plat en 15 minutes.",
    ctaLabel: "Démarrer l'essai gratuit",
  },
};
