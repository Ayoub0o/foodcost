import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email";
import { appOrigin, foodcostBasePath } from "@/lib/stripe";
import type { AppLocale } from "@/lib/supabase/database.types";

/**
 * Daily trial lifecycle cron (DIRECTIVE §11):
 * - D10 / D13 reminder emails
 * - D14 → plan = locked + lock email with export link
 *
 * Protected by CRON_SECRET bearer/header.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const ok =
    !!secret &&
    (auth === `Bearer ${secret}` || headerSecret === secret || request.nextUrl.searchParams.get("secret") === secret);
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createServiceRoleClient();
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const { data: workspaces, error } = await admin
    .from("workspaces")
    .select("id,name,locale,plan,trial_ends_at,owner_id")
    .eq("plan", "trialing")
    .is("deleted_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let locked = 0;
  let emailed = 0;

  for (const ws of workspaces ?? []) {
    const ends = new Date(ws.trial_ends_at);
    const daysLeft = Math.ceil((ends.getTime() - now.getTime()) / dayMs);
    const locale = (ws.locale === "fr" ? "fr" : "en") as AppLocale;

    const { data: owner } = await admin.auth.admin.getUserById(ws.owner_id);
    const email = owner.user?.email;
    if (!email) continue;

    if (daysLeft <= 0) {
      await admin.from("workspaces").update({ plan: "locked" }).eq("id", ws.id);
      locked++;
      const exportUrl = `${appOrigin()}${foodcostBasePath()}/${locale}/reports`;
      const r = await sendTransactionalEmail({
        to: email,
        locale,
        kind: "d14_lock",
        workspaceName: ws.name,
        exportUrl,
      });
      if (r.ok) emailed++;
      continue;
    }

    if (daysLeft === 4) {
      const r = await sendTransactionalEmail({
        to: email,
        locale,
        kind: "d10_reminder",
        workspaceName: ws.name,
        daysLeft,
      });
      if (r.ok) emailed++;
    } else if (daysLeft === 1) {
      const r = await sendTransactionalEmail({
        to: email,
        locale,
        kind: "d13_final",
        workspaceName: ws.name,
        daysLeft,
      });
      if (r.ok) emailed++;
    }
  }

  const meta = { scanned: workspaces?.length ?? 0, locked, emailed };
  await admin.from("ops_cron_runs").upsert({
    id: "trial",
    last_run_at: new Date().toISOString(),
    last_status: "ok",
    last_meta: meta,
  });

  return NextResponse.json({ ok: true, ...meta });
}

/** Allow GET for simple cron providers that only support GET. */
export async function GET(request: NextRequest) {
  return POST(request);
}
