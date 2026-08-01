import { LEGAL } from "./placeholders";
import type { LegalDoc } from "./types";

export const termsFr: LegalDoc = {
  locale: "fr",
  kind: "terms",
  title: "Conditions générales d'utilisation — FoodCost by PixPlat",
  lastUpdated: LEGAL.LAST_UPDATED,
  intro: null,
  sections: [
    {
      id: "objet",
      title: "1. Objet",
      paragraphs: [
        `Les présentes conditions régissent l'utilisation de FoodCost (« le Service »), un logiciel de gestion des coûts alimentaires exploité par ${LEGAL.ENTITY} (${LEGAL.ADDRESS}). En créant un compte, vous les acceptez.`,
      ],
    },
    {
      id: "service",
      title: "2. Le Service",
      paragraphs: [
        "FoodCost permet de créer des fiches recettes, calculer des coûts matière, analyser la rentabilité de plats et exporter des rapports. Le Service est un outil d'aide à la décision : les calculs reposent sur les données que vous saisissez, et vous demeurez seul responsable de vos décisions commerciales, de vos prix de vente et de votre conformité réglementaire (notamment en matière d'affichage des allergènes).",
      ],
    },
    {
      id: "compte",
      title: "3. Compte et admissibilité",
      paragraphs: [
        "Vous devez être majeur et utiliser le Service dans un cadre professionnel. Vous êtes responsable de la confidentialité de votre accès et de l'exactitude des renseignements fournis.",
      ],
    },
    {
      id: "essai",
      title: "4. Essai gratuit, abonnement et paiement",
      paragraphs: [
        "Le Service offre un essai gratuit de 14 jours, complet et sans carte bancaire. À l'issue de l'essai, la poursuite de l'utilisation requiert un abonnement payant (12 $ US/mois ou 120 $ US/an, taxes en sus le cas échéant), facturé d'avance via notre prestataire Stripe. À défaut d'abonnement, votre espace passe en lecture seule : vos données restent consultables et exportables, mais non modifiables.",
        `Renouvellement et annulation : l'abonnement se renouvelle automatiquement à chaque échéance. Vous pouvez l'annuler à tout moment depuis Réglages → Facturation ; l'annulation prend effet à la fin de la période payée en cours. Remboursements : sauf obligation légale contraire, les périodes déjà facturées ne sont pas remboursables ; nous examinons toutefois de bonne foi les demandes exceptionnelles à ${LEGAL.CONTACT_EMAIL}. Modification des prix : tout changement de tarif vous sera notifié au moins 30 jours à l'avance et ne s'appliquera qu'à la période de facturation suivante.`,
      ],
    },
    {
      id: "donnees",
      title: "5. Vos données",
      paragraphs: [
        "Les données que vous saisissez (ingrédients, recettes, prix) vous appartiennent. Vous nous concédez uniquement la licence technique nécessaire pour les héberger, les traiter et vous fournir le Service. Vous pouvez exporter l'intégralité de vos données à tout moment, y compris après expiration de l'essai. La suppression de votre compte entraîne la purge définitive de vos données dans les 30 jours.",
      ],
    },
    {
      id: "acceptable",
      title: "6. Utilisation acceptable",
      paragraphs: [
        "Il est interdit : d'utiliser le Service à des fins illégales ; de tenter d'accéder aux données d'autres utilisateurs ; de perturber ou surcharger l'infrastructure ; de revendre le Service sans accord écrit ; d'extraire massivement le contenu du site par des moyens automatisés.",
      ],
    },
    {
      id: "pi",
      title: "7. Propriété intellectuelle",
      paragraphs: [
        `Le Service, son code, son design et ses contenus (hors vos données) sont la propriété de ${LEGAL.ENTITY}. Aucun droit ne vous est cédé au-delà du droit d'utilisation prévu aux présentes.`,
      ],
    },
    {
      id: "garanties",
      title: "8. Disponibilité et garanties",
      paragraphs: [
        "Le Service est fourni « tel quel ». Nous visons une disponibilité élevée mais ne garantissons pas un fonctionnement ininterrompu ou exempt d'erreurs. Dans la mesure permise par la loi applicable — et sans limiter les garanties impératives prévues par la législation québécoise sur la protection du consommateur lorsqu'elle s'applique — notre responsabilité totale est limitée au montant que vous nous avez versé au cours des 12 mois précédant le fait générateur, et nous ne sommes pas responsables des dommages indirects (perte de profits, de clientèle ou de données résultant d'un cas de force majeure).",
      ],
    },
    {
      id: "resiliation",
      title: "9. Résiliation",
      paragraphs: [
        "Vous pouvez fermer votre compte à tout moment. Nous pouvons suspendre ou résilier un compte en cas de violation des présentes, après notification et, sauf urgence, un délai raisonnable pour remédier au manquement. En cas de résiliation par nous sans faute de votre part, la portion non utilisée de la période payée est remboursée au prorata.",
      ],
    },
    {
      id: "droit",
      title: "10. Droit applicable",
      paragraphs: [
        "Les présentes sont régies par les lois applicables dans la province de Québec et les lois du Canada qui s'y appliquent. Tout litige relève des tribunaux compétents du district judiciaire de Montréal, sous réserve des règles impératives de protection du consommateur.",
      ],
    },
    {
      id: "modifications",
      title: "11. Modifications des conditions",
      paragraphs: [
        "Nous pouvons modifier les présentes conditions ; toute modification substantielle sera notifiée au moins 30 jours à l'avance. La poursuite de l'utilisation après l'entrée en vigueur vaut acceptation.",
      ],
    },
  ],
};
