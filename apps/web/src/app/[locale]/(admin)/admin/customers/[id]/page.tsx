import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { extendTrial, setWorkspacePlan, startImpersonation } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.customers");
  const admin = createServiceRoleClient();

  const { data: ws } = await admin.from("workspaces").select("*").eq("id", id).maybeSingle();
  if (!ws) notFound();

  const { data: owner } = await admin.auth.admin.getUserById(ws.owner_id);
  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", id)
    .maybeSingle();
  const { count: recipesCount } = await admin
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", id)
    .is("archived_at", null);
  const { count: ingredientsCount } = await admin
    .from("ingredients")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", id)
    .is("archived_at", null);

  return (
    <div className="container-bringer py-10" data-testid="admin-customer-detail">
      <PageHeader title={ws.name} subtitle={owner.user?.email ?? ws.owner_id} />

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={t("colPlan")} value={ws.plan} />
        <Stat
          label={t("colTrial")}
          value={new Date(ws.trial_ends_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
          testId="admin-trial-ends"
        />
        <Stat label={t("colRecipes")} value={String(recipesCount ?? 0)} />
        <Stat label={t("ingredients")} value={String(ingredientsCount ?? 0)} />
        <Stat label={t("currency")} value={ws.currency} />
        <Stat label={t("stripe")} value={sub?.stripe_customer_id ?? "—"} />
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <form action={extendTrial}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="workspaceId" value={ws.id} />
          <button type="submit" data-testid="admin-extend-trial" className="btn-accent !px-4 !py-2 text-sm">
            {t("extendTrial")}
          </button>
        </form>
        <form action={setWorkspacePlan}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="workspaceId" value={ws.id} />
          <input type="hidden" name="plan" value="pro" />
          <button type="submit" className="btn-ghost !px-4 !py-2 text-sm">
            {t("compPro")}
          </button>
        </form>
        <form action={setWorkspacePlan}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="workspaceId" value={ws.id} />
          <input type="hidden" name="plan" value="locked" />
          <button type="submit" data-testid="admin-lock" className="btn-ghost !px-4 !py-2 text-sm">
            {t("lock")}
          </button>
        </form>
        <form action={startImpersonation}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="workspaceId" value={ws.id} />
          <button type="submit" data-testid="admin-impersonate" className="btn-ghost !px-4 !py-2 text-sm">
            {t("impersonate")}
          </button>
        </form>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-container p-4">
      <dt className="text-xs text-text">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-heading" data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}
