/** First focusable control for keyboard users (WCAG 2.4.1). */
export function SkipLink({ label = "Skip to main content" }: { label?: string }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xs focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-heading"
    >
      {label}
    </a>
  );
}
