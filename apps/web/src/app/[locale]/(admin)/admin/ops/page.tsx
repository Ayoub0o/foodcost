import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { runOpsChecks, type CheckStatus } from "@/lib/ops/health";

const TONE: Record<CheckStatus, string> = {
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  fail: "border-red-500/40 bg-red-500/10 text-red-300",
};

export default async function AdminOpsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.ops");
  const admin = createServiceRoleClient();

  const [checks, { data: webhooks }, { data: exports }, { data: cron }] = await Promise.all([
    runOpsChecks(),
    admin
      .from("stripe_webhook_events")
      .select("id,type,processed_at")
      .order("processed_at", { ascending: false })
      .limit(100),
    admin
      .from("exports_log")
      .select("id,kind,status,created_at,workspace_id")
      .order("created_at", { ascending: false })
      .limit(30),
    admin.from("ops_cron_runs").select("*"),
  ]);

  const failedExports = (exports ?? []).filter((e) => e.status === "failed").length;
  const pendingExports = (exports ?? []).filter(
    (e) => e.status === "pending" || e.status === "processing",
  ).length;
  const trialCron = (cron ?? []).find((c) => c.id === "trial");
  const worst = checks.some((c) => c.status === "fail")
    ? "fail"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "ok";

  return (
    <div className="container-bringer py-10" data-testid="admin-ops">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div
        className={`mt-6 rounded-lg border px-4 py-3 text-sm ${TONE[worst]}`}
        data-testid="ops-health-summary"
      >
        Health: {worst.toUpperCase()} · {checks.filter((c) => c.status === "ok").length}/
        {checks.length} checks green
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="ops-checks">
        {checks.map((c) => (
          <div key={c.id} className={`rounded-lg border px-4 py-3 text-sm ${TONE[c.status]}`}>
            <p className="font-semibold">{c.label}</p>
            <p className="mt-1 opacity-90">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card label={t("webhooks")} value={String(webhooks?.length ?? 0)} />
        <Card label={t("exportsPending")} value={String(pendingExports)} />
        <Card label={t("exportsFailed")} value={String(failedExports)} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-heading">Search Console</h2>
        <p className="mt-2 text-sm text-text">
          <a
            href="https://search.google.com/search-console"
            className="text-accent-text underline"
            rel="noopener noreferrer"
          >
            Open Google Search Console
          </a>{" "}
          — submit the FoodCost sitemap after each SEO batch (see SEO_BATCH_LOG.md).
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-heading">{t("cronTitle")}</h2>
        <p className="mt-2 text-sm text-text" data-testid="ops-cron-trial">
          {trialCron
            ? `${t("lastRun")}: ${new Date(trialCron.last_run_at).toLocaleString(
                locale === "fr" ? "fr-CA" : "en-CA",
              )} · ${trialCron.last_status}`
            : t("cronNever")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-heading">{t("webhookTitle")}</h2>
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
          {(webhooks ?? []).map((w) => (
            <li key={w.id} className="flex justify-between gap-4 border-b border-border-mute py-2">
              <span className="text-heading">{w.type}</span>
              <span className="text-xs text-text">{w.id}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-text">{t("replayHint")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-heading">{t("exportsTitle")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(exports ?? []).slice(0, 15).map((e) => (
            <li key={e.id} className="flex justify-between border-b border-border-mute py-2">
              <span className="text-heading">
                {e.kind} · {e.status}
              </span>
              <span className="text-xs text-text">
                {new Date(e.created_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-container p-5">
      <p className="text-xs text-text">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-heading">{value}</p>
    </div>
  );
}
