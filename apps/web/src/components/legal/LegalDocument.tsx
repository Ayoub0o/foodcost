import type { LegalDoc } from "@/content/legal";
import { LEGAL_REVIEW_COMMENT } from "@/content/legal";

/** Bringer-style article shell for Privacy / Terms. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="container-bringer py-16">
      <div
        dangerouslySetInnerHTML={{
          __html: `<!-- ${LEGAL_REVIEW_COMMENT} -->`,
        }}
      />

      <p className="text-xs uppercase tracking-[0.12em] text-accent-text">
        {doc.locale === "fr" ? "Légal" : "Legal"}
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-heading md:text-5xl">
        {doc.title}
      </h1>
      <p className="mt-4 text-sm text-text">
        {doc.locale === "fr" ? "Dernière mise à jour :" : "Last updated:"}{" "}
        <time>{doc.lastUpdated}</time>
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={doc.locale === "fr" ? "Table des matières" : "Table of contents"} className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
            {doc.locale === "fr" ? "Sommaire" : "Contents"}
          </p>
          <ol className="mt-4 space-y-2 text-sm text-text">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-heading">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl space-y-10 text-base leading-relaxed text-text">
          {doc.intro && <p className="text-heading">{doc.intro}</p>}
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-heading">{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="mt-4">
                  {p}
                </p>
              ))}
            </section>
          ))}
          {doc.predominanceNote && (
            <p className="border-t border-border-mute pt-8 text-sm italic text-text">
              {doc.predominanceNote}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
