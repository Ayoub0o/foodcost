export type LegalKind = "privacy" | "terms";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface LegalDoc {
  locale: "en" | "fr";
  kind: LegalKind;
  title: string;
  lastUpdated: string;
  intro: string | null;
  sections: LegalSection[];
  /** Shown only on English pages. */
  predominanceNote?: string;
}
