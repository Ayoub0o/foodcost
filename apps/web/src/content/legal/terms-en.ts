import { LEGAL } from "./placeholders";
import type { LegalDoc } from "./types";

export const termsEn: LegalDoc = {
  locale: "en",
  kind: "terms",
  title: "Terms of Service — FoodCost by PixPlat",
  lastUpdated: LEGAL.LAST_UPDATED,
  intro: null,
  predominanceNote: "In case of discrepancy, the French version prevails.",
  sections: [
    {
      id: "purpose",
      title: "1. Purpose",
      paragraphs: [
        `These terms govern use of FoodCost (“the Service”), food-cost management software operated by ${LEGAL.ENTITY} (${LEGAL.ADDRESS}). By creating an account, you accept them.`,
      ],
    },
    {
      id: "service",
      title: "2. The Service",
      paragraphs: [
        "FoodCost lets you create recipe sheets, calculate food costs, analyse dish profitability, and export reports. The Service is a decision-support tool: calculations rely on the data you enter, and you alone remain responsible for your commercial decisions, selling prices, and regulatory compliance (including allergen labelling).",
      ],
    },
    {
      id: "account",
      title: "3. Account and eligibility",
      paragraphs: [
        "You must be of legal age and use the Service in a professional capacity. You are responsible for keeping your access confidential and for the accuracy of information you provide.",
      ],
    },
    {
      id: "trial",
      title: "4. Free trial, subscription, and payment",
      paragraphs: [
        "The Service offers a full 14-day free trial with no credit card required. After the trial, continued use requires a paid subscription (USD $12/month or USD $120/year, plus applicable taxes), billed in advance via our provider Stripe. Without a subscription, your workspace becomes read-only: your data remains viewable and exportable, but not editable.",
        `Renewal and cancellation: the subscription renews automatically at each billing period. You may cancel anytime from Settings → Billing; cancellation takes effect at the end of the current paid period. Refunds: except where required by law, periods already billed are non-refundable; we nonetheless review exceptional requests in good faith at ${LEGAL.CONTACT_EMAIL}. Price changes: any price change will be notified at least 30 days in advance and will apply only to the next billing period.`,
      ],
    },
    {
      id: "data",
      title: "5. Your data",
      paragraphs: [
        "Data you enter (ingredients, recipes, prices) belongs to you. You grant us only the technical licence needed to host and process it to provide the Service. You may export all of your data at any time, including after the trial expires. Deleting your account triggers permanent purge of your data within 30 days.",
      ],
    },
    {
      id: "acceptable",
      title: "6. Acceptable use",
      paragraphs: [
        "You must not: use the Service for illegal purposes; attempt to access other users’ data; disrupt or overload the infrastructure; resell the Service without written agreement; mass-extract site content by automated means.",
      ],
    },
    {
      id: "ip",
      title: "7. Intellectual property",
      paragraphs: [
        `The Service, its code, design, and content (other than your data) are owned by ${LEGAL.ENTITY}. No rights are assigned to you beyond the use rights set out herein.`,
      ],
    },
    {
      id: "warranty",
      title: "8. Availability and warranties",
      paragraphs: [
        "The Service is provided “as is”. We aim for high availability but do not guarantee uninterrupted or error-free operation. To the extent permitted by applicable law — and without limiting mandatory warranties under Québec consumer protection legislation when it applies — our total liability is limited to the amount you paid us in the 12 months preceding the claim, and we are not liable for indirect damages (lost profits, customers, or data resulting from force majeure).",
      ],
    },
    {
      id: "termination",
      title: "9. Termination",
      paragraphs: [
        "You may close your account at any time. We may suspend or terminate an account for breach of these terms, after notice and, except in an emergency, a reasonable cure period. If we terminate without fault on your part, unused prepaid time is refunded pro rata.",
      ],
    },
    {
      id: "law",
      title: "10. Governing law",
      paragraphs: [
        "These terms are governed by the laws applicable in the province of Québec and the laws of Canada that apply there. Any dispute falls under the courts of the judicial district of Montréal, subject to mandatory consumer-protection rules.",
      ],
    },
    {
      id: "changes",
      title: "11. Changes to the terms",
      paragraphs: [
        "We may modify these terms; any material change will be notified at least 30 days in advance. Continued use after the effective date constitutes acceptance.",
      ],
    },
  ],
};
