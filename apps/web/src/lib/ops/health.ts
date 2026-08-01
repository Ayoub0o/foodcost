import { createServiceRoleClient } from "@/lib/supabase/server";

export type CheckStatus = "ok" | "warn" | "fail";

export interface OpsCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export async function runOpsChecks(): Promise<OpsCheck[]> {
  const admin = createServiceRoleClient();
  const checks: OpsCheck[] = [];

  const envKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "CRON_SECRET",
    "NEXT_PUBLIC_SENTRY_DSN",
  ] as const;
  for (const key of envKeys) {
    const present = !!process.env[key];
    const required = !key.includes("SENTRY");
    checks.push({
      id: `env_${key}`,
      label: `Env ${key}`,
      status: present ? "ok" : required ? "fail" : "warn",
      detail: present ? "set" : "missing",
    });
  }

  const staleCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 86400000).toISOString();

  const [
    { count: failedExports },
    { count: stuck },
    { data: trialCron },
    { data: purgeCron },
    { count: webhookCount },
    { count: openTickets },
  ] = await Promise.all([
    admin.from("exports_log").select("*", { count: "exact", head: true }).eq("status", "failed"),
    admin
      .from("exports_log")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "processing"])
      .lt("created_at", staleCutoff),
    admin.from("ops_cron_runs").select("*").eq("id", "trial").maybeSingle(),
    admin.from("ops_cron_runs").select("*").eq("id", "purge").maybeSingle(),
    admin
      .from("stripe_webhook_events")
      .select("*", { count: "exact", head: true })
      .gte("processed_at", dayAgo),
    admin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  checks.push({
    id: "exports_failed",
    label: "Failed exports (all time sample)",
    status: (failedExports ?? 0) > 5 ? "warn" : "ok",
    detail: String(failedExports ?? 0),
  });
  checks.push({
    id: "exports_stuck",
    label: "Exports stuck >1h",
    status: (stuck ?? 0) > 0 ? "fail" : "ok",
    detail: String(stuck ?? 0),
  });

  for (const [cronId, cron] of [
    ["trial", trialCron],
    ["purge", purgeCron],
  ] as const) {
    if (!cron) {
      checks.push({
        id: `cron_${cronId}`,
        label: `${cronId} cron last run`,
        status: "warn",
        detail: "never",
      });
    } else {
      const ageH = (Date.now() - new Date(cron.last_run_at).getTime()) / 3600000;
      checks.push({
        id: `cron_${cronId}`,
        label: `${cronId} cron last run`,
        status: ageH > 36 ? "fail" : ageH > 26 ? "warn" : "ok",
        detail: `${cron.last_status} · ${ageH.toFixed(1)}h ago`,
      });
    }
  }

  checks.push({
    id: "webhooks_24h",
    label: "Stripe webhooks (24h)",
    status: "ok",
    detail: String(webhookCount ?? 0),
  });
  checks.push({
    id: "tickets_open",
    label: "Open support tickets",
    status: (openTickets ?? 0) > 20 ? "warn" : "ok",
    detail: String(openTickets ?? 0),
  });

  return checks;
}
