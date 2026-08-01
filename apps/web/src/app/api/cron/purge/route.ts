import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

/**
 * Daily purge cron (DIRECTIVE §10):
 * - Soft-deleted workspaces older than 30 days → hard delete (+ Stripe customer delete request)
 * - Export files in Storage older than 30 days → remove + clear path
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const ok =
    !!secret &&
    (auth === `Bearer ${secret}` ||
      headerSecret === secret ||
      request.nextUrl.searchParams.get("secret") === secret);
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createServiceRoleClient();
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: doomed } = await admin
    .from("workspaces")
    .select("id")
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff);

  let workspacesPurged = 0;
  let stripeRequested = 0;

  for (const ws of doomed ?? []) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("workspace_id", ws.id)
      .maybeSingle();

    if (sub?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        await stripe.customers.del(sub.stripe_customer_id);
        stripeRequested++;
      } catch {
        // Best-effort: continue purge even if Stripe delete fails (already gone, etc.).
      }
    }

    await admin
      .from("support_tickets")
      .update({ email: "deleted-user", user_id: null, workspace_id: null })
      .eq("workspace_id", ws.id);

    await admin.from("workspaces").delete().eq("id", ws.id);
    workspacesPurged++;
  }

  const { data: oldExports } = await admin
    .from("exports_log")
    .select("id,file_path")
    .lt("created_at", cutoff)
    .not("file_path", "is", null)
    .limit(200);

  let filesRemoved = 0;
  for (const row of oldExports ?? []) {
    if (!row.file_path) continue;
    await admin.storage.from("exports").remove([row.file_path]);
    await admin.from("exports_log").update({ file_path: null }).eq("id", row.id);
    filesRemoved++;
  }

  await admin.from("ops_cron_runs").upsert({
    id: "purge",
    last_run_at: new Date().toISOString(),
    last_status: "ok",
    last_meta: { workspacesPurged, filesRemoved, stripeRequested },
  });

  return NextResponse.json({ ok: true, workspacesPurged, filesRemoved, stripeRequested });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
