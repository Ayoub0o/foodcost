export interface TemplateDownload {
  title: string;
  description: string;
  /** File name under /public/templates. */
  file: string;
  /** Human label for the file format, e.g. "CSV · Excel". */
  format: string;
}

export interface TemplatesContent {
  hero: { h1: string; subtitle: string };
  definition: string;
  downloads: TemplateDownload[];
  form: {
    heading: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitLabel: string;
    consent: string;
    error: string;
    invalidEmail: string;
  };
  unlocked: { title: string; body: string; downloadLabel: string };
  faq: { h2: string; items: { question: string; answer: string }[] };
  finalCta: { h2: string; body: string; ctaLabel: string };
}
