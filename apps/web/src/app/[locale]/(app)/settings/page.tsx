import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { BillingCard } from "@/components/app/BillingCard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace, isWorkspaceLocked } from "@/lib/workspace";
import { hasYearlyPrice } from "@/lib/stripe";
import { softDeleteWorkspace, updateWorkspaceSettings } from "./actions";
import type { AppLocale } from "@/lib/supabase/database.types";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; billing?: string; deleteError?: string; readonly?: string }>;
}) {
  const { locale } = await params;
  const { saved, billing, deleteError, readonly } = await searchParams;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);
  const { workspace } = session;

  // Re-read fresh workspace values.
  const supabase = await createClient();
  const { data } = await supabase.from("workspaces").select("*").eq("id", workspace.id).single();
  const ws = data ?? workspace;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id,status")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(ws.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  const t = await getTranslations("App.settings");
  const tc = await getTranslations("App.common");

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {saved === "1" && (
        <p className="mt-6 rounded-xs border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {t("saved")}
        </p>
      )}
      {billing === "success" && (
        <p className="mt-6 rounded-xs border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {t("billingSuccess")}
        </p>
      )}
      {readonly === "1" && (
        <p className="mt-6 rounded-xs border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="alert">
          {t("readonlyBlocked")}
        </p>
      )}

      <form action={updateWorkspaceSettings} className="mt-8 max-w-lg space-y-5">
        <input type="hidden" name="locale" value={locale} />

        <label className="block">
          <span className="block text-sm font-medium text-heading">{t("workspaceName")}</span>
          <input name="name" defaultValue={ws.name} required className="input" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-heading">{t("currency")}</span>
            <select name="currency" defaultValue={ws.currency} className="input">
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-heading">{t("locale")}</span>
            <select name="wsLocale" defaultValue={ws.locale} className="input">
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-heading">{t("targetFc")}</span>
          <input
            name="targetFc"
            type="number"
            step="0.1"
            min="1"
            max="99"
            defaultValue={Number(ws.target_food_cost_pct)}
            className="input"
          />
          <span className="mt-1 block text-xs text-text">{t("targetFcHelp")}</span>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-heading">{t("vatMode")}</span>
          <select name="vatMode" defaultValue={ws.vat_mode} className="input">
            <option value="ht">{t("vatHt")}</option>
            <option value="ttc">{t("vatTtc")}</option>
          </select>
          <span className="mt-1 block text-xs text-text">{t("vatHelp")}</span>
        </label>

        <button type="submit" className="btn-accent">
          {tc("save")}
        </button>
      </form>

      <BillingCard
        locale={locale}
        plan={ws.plan}
        trialDaysLeft={trialDaysLeft}
        locked={isWorkspaceLocked(ws)}
        hasCustomer={!!sub?.stripe_customer_id}
        pastDue={sub?.status === "past_due"}
        yearlyAvailable={hasYearlyPrice()}
      />

      <section className="mt-12 max-w-lg border-t border-border-mute pt-10" data-testid="privacy-section">
        <h2 className="text-lg font-semibold text-heading">{t("privacyTitle")}</h2>
        <p className="mt-2 text-sm text-text">{t("privacyBody")}</p>
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost"}/api/exports/data`}
          className="btn-accent mt-4 inline-flex"
          data-testid="export-all-data"
        >
          {t("exportAll")}
        </a>

        <div className="mt-10 rounded-lg border border-red-500/30 bg-red-500/5 p-5">
          <h3 className="text-sm font-semibold text-heading">{t("deleteTitle")}</h3>
          <p className="mt-2 text-sm text-text">{t("deleteBody")}</p>
          {deleteError === "1" && (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {t("deleteMismatch")}
            </p>
          )}
          <form action={softDeleteWorkspace} className="mt-4 space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <label className="block">
              <span className="block text-sm font-medium text-heading">{t("deleteConfirm")}</span>
              <input
                name="confirmName"
                required
                autoComplete="off"
                placeholder={ws.name}
                className="input"
                data-testid="delete-confirm-name"
              />
            </label>
            <button type="submit" className="btn-ghost text-red-300" data-testid="delete-workspace">
              {t("deleteSubmit")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
