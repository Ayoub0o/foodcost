import { stopImpersonation } from "@/app/[locale]/(admin)/admin/customers/actions";

export function ImpersonationBanner({
  locale,
  workspaceName,
}: {
  locale: string;
  workspaceName: string;
}) {
  return (
    <div
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-100"
      data-testid="impersonation-banner"
    >
      <div className="container-bringer flex flex-wrap items-center justify-between gap-3">
        <p>
          Viewing as <strong className="text-heading">{workspaceName}</strong> (read-only)
        </p>
        <form action={stopImpersonation}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="text-xs font-semibold underline">
            Exit impersonation
          </button>
        </form>
      </div>
    </div>
  );
}
