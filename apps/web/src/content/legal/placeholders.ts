/**
 * Legal entity placeholders — fill before launch.
 * TODO: replace with real PixPlat / FoodCost legal entity details.
 */
export const LEGAL = {
  ENTITY: "[LEGAL_ENTITY_NAME]",
  ADDRESS: "[LEGAL_ADDRESS]",
  CONTACT_EMAIL: "[CONTACT_EMAIL]",
  PRIVACY_OFFICER: "[PRIVACY_OFFICER_NAME]",
  HOSTING: "[HOSTING_PROVIDER, ex. Vercel]",
  ANALYTICS: "[ANALYTICS_PROVIDER]",
  LAST_UPDATED: "[DATE]",
} as const;

export const LEGAL_REVIEW_COMMENT =
  "LEGAL REVIEW REQUIRED — draft generated, must be validated by a qualified lawyer before official launch";
