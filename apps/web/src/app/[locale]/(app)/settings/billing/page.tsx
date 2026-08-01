import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { BillingCard } from "@/components/app/BillingCard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace, isWorkspaceLocked } from "@/lib/workspace";
import { hasYearlyPrice } from "@/lib/stripe";
import type { AppLocale } from "@/lib/supabase/database.types";

export default async function BillingSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);
  const { workspace } = session;

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id,status")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(workspace.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  const t = await getTranslations("App.settings");

  return (
    <div className="container-bringer py-10" data-testid="billing-page">
      <PageHeader title={t("billingTitle")} subtitle={t("billingPageSubtitle")} />

      {status === "success" && (
        <p className="mt-6 rounded-xs border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {t("billingSuccess")}
        </p>
      )}
      {status === "cancel" && (
        <p className="mt-6 rounded-xs border border-border px-4 py-3 text-sm text-text">
          {t("billingCancelled")}
        </p>
      )}

      <BillingCard
        locale={locale}
        plan={workspace.plan}
        trialDaysLeft={trialDaysLeft}
        locked={isWorkspaceLocked(workspace)}
        hasCustomer={!!sub?.stripe_customer_id}
        pastDue={sub?.status === "past_due"}
        yearlyAvailable={hasYearlyPrice()}
      />
    </div>
  );
}
