import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { ImpersonationBanner } from "@/components/app/ImpersonationBanner";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace, isWorkspaceLocked } from "@/lib/workspace";
import type { AnnouncementRow, AppLocale } from "@/lib/supabase/database.types";

/** App routes are always user-specific. */
export const dynamic = "force-dynamic";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) {
    redirect(`/${locale}/login`);
  }
  const { user, workspace, impersonating } = session;

  const supabase = await createClient();
  const now = new Date().toISOString();
  const [{ data: annData }, { data: sub }] = await Promise.all([
    supabase
      .from("announcements")
      .select("id,title,body,level,starts_at,ends_at,locale,active")
      .eq("active", true)
      .or(`locale.is.null,locale.eq.${locale}`)
      .limit(5),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
  ]);
  const announcements = ((annData ?? []) as AnnouncementRow[]).filter((a) => {
    if (a.starts_at && a.starts_at > now) return false;
    if (a.ends_at && a.ends_at < now) return false;
    return true;
  });
  const pastDue = sub?.status === "past_due";

  return (
    <>
      {impersonating && (
        <ImpersonationBanner locale={locale} workspaceName={workspace.name} />
      )}
      {pastDue && (
        <div
          className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-3 text-center text-sm text-amber-100"
          data-testid="payment-failed-banner"
        >
          {locale === "fr"
            ? "Échec de paiement — mettez à jour votre carte dans Facturation pour éviter le verrouillage."
            : "Payment failed — update your card in Billing to avoid lockout."}{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost"}/${locale}/settings/billing`}
            className="underline"
          >
            {locale === "fr" ? "Ouvrir la facturation" : "Open billing"}
          </a>
        </div>
      )}
      {announcements.map((a) => (
        <AnnouncementBanner key={a.id} id={a.id} title={a.title} body={a.body} level={a.level} />
      ))}
      <AppShell
        locale={locale}
        workspaceName={workspace.name}
        userEmail={user.email ?? ""}
        trialDaysLeft={daysUntil(workspace.trial_ends_at)}
        locked={isWorkspaceLocked(workspace)}
        plan={workspace.plan}
      >
        {children}
      </AppShell>
    </>
  );
}
