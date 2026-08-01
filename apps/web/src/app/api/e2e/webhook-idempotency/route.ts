import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { e2eDisabledResponse } from "@/lib/e2e-guard";

/**
 * E2E helper: prove Stripe webhook event ids are replay-safe via the unique PK
 * on `stripe_webhook_events` (same guarantee the webhook route uses).
 */
export async function POST(request: NextRequest) {
  const disabled = e2eDisabledResponse();
  if (disabled) return disabled;

  const secret = process.env.E2E_SETUP_SECRET;
  const provided =
    request.headers.get("x-e2e-secret") ?? request.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createServiceRoleClient();
  const id = `evt_e2e_${Date.now()}`;

  const first = await admin.from("stripe_webhook_events").insert({
    id,
    type: "e2e.test",
    payload: { ok: true },
  });
  if (first.error) {
    return NextResponse.json({ error: first.error.message }, { status: 500 });
  }

  const second = await admin.from("stripe_webhook_events").insert({
    id,
    type: "e2e.test",
    payload: { ok: true },
  });

  const duplicateBlocked = !!second.error;

  // Cleanup
  await admin.from("stripe_webhook_events").delete().eq("id", id);

  return NextResponse.json({
    ok: true,
    eventId: id,
    duplicateBlocked,
  });
}
