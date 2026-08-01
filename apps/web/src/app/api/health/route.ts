import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appVersion } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public health probe for load balancers / uptime monitors.
 * Does not expose secrets. DB check uses the anon key with a cheap query.
 */
export async function GET() {
  const version = appVersion();
  const started = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let db: "ok" | "error" | "unconfigured" = "unconfigured";
  let dbDetail: string | undefined;

  if (url && anon) {
    try {
      const supabase = createClient(url, anon, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      // Lightweight connectivity probe — profiles is RLS-protected; empty/401 still proves network.
      const { error } = await supabase.from("profiles").select("id").limit(1);
      // RLS may deny rows for anon; connection success = no network/config error code.
      if (error && /fetch|network|ENOTFOUND|ECONNREFUSED/i.test(error.message)) {
        db = "error";
        dbDetail = "unreachable";
      } else {
        db = "ok";
      }
    } catch (err) {
      db = "error";
      dbDetail = err instanceof Error ? err.message : "unknown";
    }
  }

  const body = {
    ok: db !== "error",
    service: "foodcost",
    version,
    db,
    ...(dbDetail ? { dbDetail } : {}),
    durationMs: Date.now() - started,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: db === "error" ? 503 : 200 });
}
