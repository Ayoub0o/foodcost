/**
 * A 40–55-word definitional paragraph rendered directly under the H1. Snippet /
 * AI-Overview bait (PRD §9-A A3/A5). Every guide/tool page opens with one.
 */
export function Definition({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border-l-2 border-accent bg-container/60 px-5 py-4 text-lg leading-relaxed text-heading">
      {children}
    </p>
  );
}
