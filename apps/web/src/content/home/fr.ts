import type { HomeContent } from "./types";
import { calculatorContentFr } from "@/content/calculator/fr";

export const homeContentFr: HomeContent = {
  hero: {
    h1: "Logiciel de food cost pour restaurants indépendants",
    subtitle:
      "Fiches techniques, marges en direct et exports Excel soignés — connaissez le coût réel et le coût matière de chaque plat en 15 minutes. Sans caisse. Sans rendez-vous commercial.",
    ctaPrimary: "Démarrer l'essai gratuit de 14 jours",
    ctaSecondary: "Essayer le calculateur gratuit",
    trust: "12 $/mois — sans démo, annulable à tout moment",
  },
  stats: [
    { label: "Jusqu'au premier coût matière", value: "< 15 min" },
    { label: "Prix mensuel", value: "12 $" },
    { label: "Recettes & ingrédients", value: "Illimités" },
    { label: "Rendez-vous commercial", value: "Jamais" },
  ],
  problem: {
    h2: "Votre fichier Excel de coût matière date de 18 mois",
    paragraphs: [
      "La plupart des restaurants indépendants calculent leur carte dans un tableur mis à jour il y a un an et demi. Les prix fournisseurs dérivent en silence, les portions gonflent, et les marges perdent quelques points chaque année sans qu'on sache quels plats posent problème.",
      "FoodCost remplace ce tableur fragile par un calcul de recette en direct. Importez vos ingrédients, construisez vos fiches techniques une fois, et chaque plat reste exact quand les prix bougent — avec des exports plus propres que votre propre tableur.",
    ],
    linkLabel: "Voir le modèle de fiche technique",
  },
  features: {
    h2: "Tout pour maîtriser votre coût matière",
    blocks: [
      { title: "Fiches techniques & coût de revient", body: "Construisez des recettes costées avec sous-recettes, rendement/perte de coupe, allergènes et photos. Obtenez coût par portion, prix suggéré et marge sur chaque plat." },
      { title: "Propagation instantanée & alertes", body: "Changez un prix d'ingrédient et toutes les recettes concernées se recalculent instantanément — avec une alerte quand un plat dépasse votre coût matière cible. La raison de quitter Excel." },
      { title: "Tableau de rentabilité", body: "Classez chaque plat par marge et coût matière %, repérez vos plats les moins rentables et voyez les moyennes de la carte d'un coup d'œil." },
      { title: "Exports Excel & PDF", body: "Rapports de rentabilité en un clic, livre de recettes complet et fiches techniques imprimables — formatés et prêts pour votre comptable." },
    ],
  },
  miniCalc: {
    h2: "Essayez maintenant — costez un plat en quelques secondes",
    body: "Ajoutez quelques ingrédients ci-dessous pour voir le coût par portion, le coût matière et le prix suggéré. C'est le même moteur que le produit complet.",
    openLabel: "Ouvrir le calculateur complet",
  },
  how: {
    h2: "Comment ça marche",
    steps: [
      { name: "Ajoutez vos ingrédients", text: "Saisissez ou importez vos ingrédients avec prix d'achat et unités. Partez d'une bibliothèque de 300 produits si vous le souhaitez." },
      { name: "Construisez vos recettes", text: "Composez des plats à partir d'ingrédients et de sous-recettes avec quantités. Les coûts se calculent en direct." },
      { name: "Surveillez vos marges", text: "Voyez coût matière %, marge et statut pour chaque plat — et soyez alerté dès qu'un changement de prix en fait dépasser un." },
    ],
  },
  comparison: {
    h2: "Abordable, en libre-service, bilingue",
    columns: ["", "Prix", "Inscription libre-service", "FR + EN", "Conçu pour 1 emplacement"],
    rows: [
      { name: "FoodCost by PixPlat", price: "12 $/mois (public)", selfServe: "Oui", frSupport: "Oui", singleLocation: "Oui", highlight: true },
      { name: "meez", price: "Non public — démo requise", selfServe: "Non", frSupport: "EN seulement", singleLocation: "Groupes" },
      { name: "Octogone", price: "Non public — démo requise", selfServe: "Non", frSupport: "FR + EN", singleLocation: "Suite d'ops" },
      { name: "MarketMan", price: "Public (variable) — axé inventaire", selfServe: "Partiel", frSupport: "EN", singleLocation: "Chaînes" },
    ],
    sourceNote:
      "Les prix des concurrents sont affichés tels que publiés lorsqu'ils sont publics, ou étiquetés « non public — démo requise » sinon. Revérifiés chaque trimestre ; dernière vérification 2026.",
  },
  benchmarks: {
    h2: "Coût matière moyen par type de restaurant",
    columns: ["Type de restaurant", "Coût matière typique %"],
    rows: calculatorContentFr.benchmarks.rows,
    caption: "Fourchettes issues de références sectorielles — validez avec vos propres chiffres. Mise à jour 2026.",
  },
  testimonials: {
    h2: "Conçu avec des restaurateurs indépendants",
    note: "Nous publions uniquement des témoignages de vrais utilisateurs bêta. Les avis apparaîtront ici dès que nos premiers restaurants partageront leurs résultats.",
  },
  faq: {
    h2: "Questions fréquentes",
    items: calculatorContentFr.faq.items,
  },
  resources: {
    h2: "Ressources & outils",
    cards: [
      { title: "Calculateur de coût matière gratuit", body: "Costez un plat, obtenez le coût matière et le prix suggéré — sans inscription.", href: "/calculator" },
      { title: "Tarifs", body: "Un forfait, 12 $/mois, essai gratuit de 14 jours. Voir ce qui est inclus.", href: "/pricing" },
      { title: "Le coût de revient, expliqué", body: "Apprenez les formules et comment la propagation instantanée protège votre marge.", href: "/calculator" },
    ],
  },
  finalCta: {
    h2: "Connaissez la marge réelle de chaque plat",
    body: "Démarrez votre essai gratuit de 14 jours — toutes les fonctionnalités, sans carte de crédit, et vos données toujours exportables. 12 $/mois ensuite, annulable à tout moment.",
    ctaLabel: "Démarrer l'essai gratuit",
  },
};
