import { LEGAL } from "./placeholders";
import type { LegalDoc } from "./types";

export const privacyEn: LegalDoc = {
  locale: "en",
  kind: "privacy",
  title: "Privacy Policy — FoodCost by PixPlat",
  lastUpdated: LEGAL.LAST_UPDATED,
  intro: `FoodCost is a service operated by ${LEGAL.ENTITY}, established in Québec, Canada (${LEGAL.ADDRESS}) (“we”). This policy describes what personal information we collect, why, how we use and protect it, and your rights. It is designed to comply with Québec’s Law 25 and, where applicable, the GDPR (European Union).`,
  predominanceNote: "In case of discrepancy, the French version prevails.",
  sections: [
    {
      id: "information",
      title: "1. Information we collect",
      paragraphs: [
        "Account data: email address, name (optional), preferred language — provided when you create an account. Business data you enter: ingredient names, purchase prices, recipes, technical sheets, menu prices, and related workspace data. This data belongs to you. Billing data: processed by our payment provider Stripe. We never store your card number; we only keep Stripe customer and subscription identifiers. Support data: the content of your support requests and related emails. Usage data: aggregated audience measurement of our pages (pages visited, referrers). We prefer cookieless measurement; if a tool requiring consent is used, a consent banner will be shown first.",
      ],
    },
    {
      id: "purposes",
      title: "2. Purposes and legal bases",
      paragraphs: [
        "We use your information to: provide the service (contract performance); process payments and prevent fraud (contract performance, legal obligation); send essential transactional emails — sign-in, billing, trial end, support replies (contract performance); improve the product from aggregated statistics (legitimate interest); send marketing communications only if you have explicitly consented (consent, withdrawable in one click).",
        "We never sell your personal information. We do not use it for targeted advertising.",
      ],
    },
    {
      id: "sharing",
      title: "3. Sharing and processors",
      paragraphs: [
        `Your data is processed by providers strictly necessary for the service: Supabase (database and authentication), Stripe (payments), Resend (email delivery), ${LEGAL.HOSTING} (hosting), ${LEGAL.ANALYTICS} (audience measurement). Some providers may process data outside Québec and Canada (including the United States and the European Union); we frame these transfers with appropriate contractual agreements and a privacy impact assessment under Law 25.`,
      ],
    },
    {
      id: "retention",
      title: "4. Retention",
      paragraphs: [
        "Your workspace data is retained while your account is active. If you delete your account or workspace: immediate deactivation, then permanent purge from our systems within 30 days (except where a legal retention duty applies, including accounting). Generated export files are removed from storage after 30 days. Audit logs are retained for 24 months.",
      ],
    },
    {
      id: "rights",
      title: "5. Your rights",
      paragraphs: [
        `You may at any time: access your information; correct it; delete it; obtain a portable copy of all your data (full export available directly in Settings → Data, including after your trial expires); withdraw consent to marketing communications; request that dissemination of information cease. To exercise these rights: ${LEGAL.CONTACT_EMAIL}. You may also lodge a complaint with the Commission d'accès à l'information du Québec (Québec's privacy regulator) or, where applicable, the competent authority in your jurisdiction.`,
      ],
    },
    {
      id: "officer",
      title: "6. Privacy officer",
      paragraphs: [
        `Under Law 25, the person responsible for the protection of personal information is: ${LEGAL.PRIVACY_OFFICER}, reachable at ${LEGAL.CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "security",
      title: "7. Security and incidents",
      paragraphs: [
        "We apply reasonable measures: encryption in transit, workspace access control (strict isolation), administrative access logging, regular backups. In the event of a confidentiality incident presenting a risk of serious harm, we will notify you and the Commission d'accès à l'information as required by law, and will keep an incident register.",
      ],
    },
    {
      id: "cookies",
      title: "8. Cookies",
      paragraphs: [
        "We use only cookies strictly necessary for operation (authentication session, language preference). No advertising cookies. If a measurement tool requiring consent is introduced, it will be activated only after your explicit agreement.",
      ],
    },
    {
      id: "minors",
      title: "9. Minors",
      paragraphs: [
        "The service is intended for professionals and is not directed at persons under 18.",
      ],
    },
    {
      id: "changes",
      title: "10. Changes",
      paragraphs: [
        "Any material change to this policy will be notified by email or by an in-app notice at least 30 days before it takes effect.",
      ],
    },
  ],
};
