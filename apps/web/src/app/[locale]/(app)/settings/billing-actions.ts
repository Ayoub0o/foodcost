"use server";

import {
  createCheckoutSession,
  createPortalSession,
  type BillingInterval,
} from "@/lib/stripe/billing-sessions";

/** Server action: Stripe Checkout for Pro Monthly (or Yearly if configured). */
export async function createCheckoutSessionAction(input: {
  workspaceId: string;
  interval?: BillingInterval;
  locale?: string;
}) {
  return createCheckoutSession(input);
}

/** Server action: Stripe Billing Portal. */
export async function createPortalSessionAction(input: {
  workspaceId: string;
  locale?: string;
}) {
  return createPortalSession(input);
}
