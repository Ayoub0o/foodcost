import type Stripe from "stripe";
import { applyStripeEvent, type AdminDb, type WebhookHandleResult } from "./webhook-handlers";

export type ProcessWebhookResult = WebhookHandleResult & {
  duplicate: boolean;
};

/**
 * Idempotent Stripe event processor: skip if event id already in stripe_webhook_events.
 */
export async function processStripeWebhookEvent(
  admin: AdminDb,
  event: Stripe.Event,
): Promise<ProcessWebhookResult> {
  const { data: existing } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existing) {
    return { handled: true, duplicate: true, action: "duplicate" };
  }

  const outcome = await applyStripeEvent(admin, event);

  await admin.from("stripe_webhook_events").insert({
    id: event.id,
    type: event.type,
    payload: {
      ...(event as unknown as Record<string, unknown>),
      _outcome: outcome,
    },
  });

  return { ...outcome, duplicate: false };
}
