import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { processStripeWebhookEvent } from "@/lib/stripe/process-webhook";

export const runtime = "nodejs";

/**
 * Idempotent Stripe webhook handler (DIRECTIVE §11).
 * Processed event ids are stored in `stripe_webhook_events`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook secret missing" }, { status: 500 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  let outcome;
  try {
    outcome = await processStripeWebhookEvent(admin, event);
  } catch (err) {
    const message = err instanceof Error ? err.message : "handler failed";
    console.error("[stripe:webhook]", event.type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (outcome.duplicate) {
    console.info("[stripe:webhook] duplicate", event.id, event.type);
    return NextResponse.json({ received: true, duplicate: true });
  }

  console.info(
    "[stripe:webhook]",
    event.type,
    outcome.action ?? "noop",
    outcome.workspaceId ?? "",
  );

  return NextResponse.json({ received: true, ...outcome });
}
