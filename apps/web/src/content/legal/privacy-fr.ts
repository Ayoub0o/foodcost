import { LEGAL } from "./placeholders";
import type { LegalDoc } from "./types";

export const privacyFr: LegalDoc = {
  locale: "fr",
  kind: "privacy",
  title: "Politique de confidentialité — FoodCost by PixPlat",
  lastUpdated: LEGAL.LAST_UPDATED,
  intro: `FoodCost est un service exploité par ${LEGAL.ENTITY}, établie au Québec, Canada (${LEGAL.ADDRESS}) (« nous »). La présente politique décrit quels renseignements personnels nous recueillons, pourquoi, comment nous les utilisons et les protégeons, et quels sont vos droits. Elle est conçue pour respecter la Loi 25 (Québec) ainsi que, le cas échéant, le RGPD (Union européenne).`,
  sections: [
    {
      id: "renseignements",
      title: "1. Renseignements que nous recueillons",
      paragraphs: [
        "Données de compte : adresse courriel, nom (facultatif), langue préférée — fournies lors de la création du compte. Données d'entreprise saisies par vous : noms d'ingrédients, prix d'achat, recettes, fiches techniques, prix de vente et données associées à votre espace de travail. Ces données vous appartiennent. Données de facturation : traitées par notre prestataire de paiement Stripe. Nous ne stockons jamais votre numéro de carte ; nous conservons uniquement des identifiants de client et d'abonnement Stripe. Données de support : contenu de vos demandes d'assistance et courriels associés. Données d'usage : mesure d'audience agrégée de nos pages (pages visitées, provenance). Nous privilégions une mesure sans témoins (cookies) ; si un outil nécessitant le consentement est utilisé, une bannière de consentement vous sera présentée au préalable.",
      ],
    },
    {
      id: "finalites",
      title: "2. Finalités et bases de traitement",
      paragraphs: [
        "Nous utilisons vos renseignements pour : fournir le service (exécution du contrat) ; traiter les paiements et prévenir la fraude (exécution du contrat, obligation légale) ; vous envoyer les courriels transactionnels indispensables — connexion, facturation, fin d'essai, réponses au support (exécution du contrat) ; améliorer le produit à partir de statistiques agrégées (intérêt légitime) ; vous envoyer des communications marketing uniquement si vous y avez explicitement consenti (consentement, retirable en un clic).",
        "Nous ne vendons jamais vos renseignements personnels. Nous ne les utilisons pas à des fins de publicité ciblée.",
      ],
    },
    {
      id: "partage",
      title: "3. Partage et sous-traitants",
      paragraphs: [
        `Vos données sont traitées par des prestataires strictement nécessaires au service : Supabase (base de données et authentification), Stripe (paiements), Resend (envoi de courriels), ${LEGAL.HOSTING} (hébergement), ${LEGAL.ANALYTICS} (mesure d'audience). Certains prestataires peuvent traiter des données à l'extérieur du Québec et du Canada (notamment aux États-Unis et dans l'Union européenne) ; nous encadrons ces transferts par des ententes contractuelles appropriées et une évaluation des facteurs relatifs à la vie privée conformément à la Loi 25.`,
      ],
    },
    {
      id: "conservation",
      title: "4. Conservation",
      paragraphs: [
        "Les données de votre espace de travail sont conservées tant que votre compte est actif. En cas de suppression de compte ou d'espace de travail : désactivation immédiate, puis purge définitive de nos systèmes dans un délai de 30 jours (sauf obligation légale de conservation, notamment comptable). Les fichiers d'export générés sont supprimés du stockage après 30 jours. Les journaux d'audit sont conservés 24 mois.",
      ],
    },
    {
      id: "droits",
      title: "5. Vos droits",
      paragraphs: [
        `Vous pouvez en tout temps : accéder à vos renseignements ; les rectifier ; les supprimer ; obtenir une copie portable de l'ensemble de vos données (export complet disponible directement dans Réglages → Données, y compris si votre essai est expiré) ; retirer votre consentement aux communications marketing ; demander la cessation de la diffusion d'un renseignement. Pour exercer ces droits : ${LEGAL.CONTACT_EMAIL}. Vous pouvez également porter plainte auprès de la Commission d'accès à l'information du Québec ou, le cas échéant, de l'autorité de protection compétente de votre juridiction.`,
      ],
    },
    {
      id: "responsable",
      title: "6. Responsable de la protection des renseignements personnels",
      paragraphs: [
        `Conformément à la Loi 25, la personne responsable de la protection des renseignements personnels est : ${LEGAL.PRIVACY_OFFICER}, joignable à ${LEGAL.CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "securite",
      title: "7. Sécurité et incidents",
      paragraphs: [
        "Nous appliquons des mesures raisonnables : chiffrement en transit, contrôle d'accès par espace de travail (isolation stricte), journalisation des accès administratifs, sauvegardes régulières. En cas d'incident de confidentialité présentant un risque de préjudice sérieux, nous vous en informerons ainsi que la Commission d'accès à l'information, conformément à la loi, et tiendrons un registre des incidents.",
      ],
    },
    {
      id: "temoins",
      title: "8. Témoins (cookies)",
      paragraphs: [
        "Nous utilisons uniquement les témoins strictement nécessaires au fonctionnement (session d'authentification, préférence de langue). Aucun témoin publicitaire. Si un outil de mesure nécessitant le consentement venait à être utilisé, il ne serait activé qu'après votre accord explicite.",
      ],
    },
    {
      id: "mineurs",
      title: "9. Mineurs",
      paragraphs: [
        "Le service s'adresse aux professionnels et n'est pas destiné aux personnes de moins de 18 ans.",
      ],
    },
    {
      id: "modifications",
      title: "10. Modifications",
      paragraphs: [
        "Toute modification substantielle de cette politique vous sera notifiée par courriel ou par un avis dans l'application au moins 30 jours avant son entrée en vigueur.",
      ],
    },
  ],
};
