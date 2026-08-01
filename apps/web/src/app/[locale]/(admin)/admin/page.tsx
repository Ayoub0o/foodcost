import { getTranslations, setRequestLocale } from "next-intl/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/PageHeader";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.overview");
  const admin = createServiceRoleClient();

  const now = Date.now();
  const d7 = new Date(now - 7 * 86400000).toISOString();
  const d30 = new Date(now - 30 * 86400000).toISOString();

  const [
    { count: activeTrials },
    { count: proCount },
    { count: workspaces7 },
    { count: workspaces30 },
    { count: openTickets },
    { count: webhookEvents },
    { count: costed },
  ] = await Promise.all([
    admin.from("workspaces").select("*", { count: "exact", head: true }).eq("plan", "trialing").is("deleted_at", null),
    admin.from("workspaces").select("*", { count: "exact", head: true }).eq("plan", "pro").is("deleted_at", null),
    admin.from("workspaces").select("*", { count: "exact", head: true }).gte("created_at", d7).is("deleted_at", null),
    admin.from("workspaces").select("*", { count: "exact", head: true }).gte("created_at", d30).is("deleted_at", null),
    admin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    admin.from("stripe_webhook_events").select("*", { count: "exact", head: true }),
    admin
      .from("recipe_cost_cache")
      .select("*", { count: "exact", head: true })
      .not("food_cost_pct", "is", null),
  ]);

  const mrr = (proCount ?? 0) * 12; // $12/mo estimate
  const trials = activeTrials ?? 0;
  const paid = proCount ?? 0;
  const conversion = trials + paid > 0 ? Math.round((paid / (trials + paid)) * 1000) / 10 : 0;

  const cards = [
    { label: t("mrr"), value: `$${mrr}` },
    { label: t("trials"), value: String(trials) },
    { label: t("conversion"), value: `${conversion}%` },
    { label: t("workspaces7"), value: String(workspaces7 ?? 0) },
    { label: t("workspaces30"), value: String(workspaces30 ?? 0) },
    { label: t("activation"), value: String(costed ?? 0) },
    { label: t("openTickets"), value: String(openTickets ?? 0) },
    { label: t("webhooks"), value: String(webhookEvents ?? 0) },
  ];

  return (
    <div className="container-bringer py-10" data-testid="admin-overview">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-container p-5">
            <p className="text-xs text-text">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
