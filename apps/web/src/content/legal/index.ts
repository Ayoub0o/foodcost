import { privacyEn } from "./privacy-en";
import { privacyFr } from "./privacy-fr";
import { termsEn } from "./terms-en";
import { termsFr } from "./terms-fr";
import type { LegalDoc, LegalKind } from "./types";

export type { LegalDoc, LegalKind } from "./types";
export { LEGAL, LEGAL_REVIEW_COMMENT } from "./placeholders";

export function getLegalDoc(kind: LegalKind, locale: string): LegalDoc {
  if (kind === "privacy") return locale === "fr" ? privacyFr : privacyEn;
  return locale === "fr" ? termsFr : termsEn;
}
