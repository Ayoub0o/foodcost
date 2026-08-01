export function formatMoneyCents(
  cents: number | null | undefined,
  currency: string,
  locale: string,
): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatPct(pct: number | null | undefined, locale: string): string {
  if (pct == null) return "—";
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(pct) + " %";
}

export const STATUS_TONE: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  orange: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  no_price: "bg-white/5 text-text border-border",
};
