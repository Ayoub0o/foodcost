import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  appOrigin,
  foodcostBasePath,
  getStripe,
  stripePriceMonthly,
  stripePriceYearly,
} from "@/lib/stripe";

export type BillingInterval = "month" | "year";

/**
 * Server-side Checkout session for Pro (no Stripe trial — trial is app-side).
 * Verifies the caller is the workspace owner.
 */
export async function createCheckoutSession(opts: {
  workspaceId: string;
  interval?: BillingInterval;
  locale?: string;
}): Promise<{ url: string } | { error: string; status: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized", status: 401 };

  const interval = opts.interval === "year" ? "year" : "month";
  const locale = opts.locale === "fr" ? "fr" : "en";
  const workspaceId = opts.workspaceId;

  if (interval === "year" && !stripePriceYearly()) {
    return { error: "yearly_price_unavailable", status: 400 };
  }
  const priceId = interval === "year" ? stripePriceYearly()! : stripePriceMonthly();

  const { data: ownerCheck } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownerCheck?.role !== "owner") {
    return { error: "owner_required", status: 403 };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const stripe = getStripe();
  const base = `${appOrigin()}${foodcostBasePath()}`;
  let customerId = sub?.stripe_customer_id ?? undefined;

  if (!customerId && user.email) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { workspace_id: workspaceId, user_id: user.id },
    });
    customerId = customer.id;
    const admin = createServiceRoleClient();
    await admin.from("subscriptions").upsert(
      {
        workspace_id: workspaceId,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    customer_email: customerId ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/${locale}/settings/billing?status=success`,
    cancel_url: `${base}/${locale}/settings/billing?status=cancel`,
    client_reference_id: workspaceId,
    metadata: { workspace_id: workspaceId, user_id: user.id },
    subscription_data: { metadata: { workspace_id: workspaceId } },
    allow_promotion_codes: true,
    // Trial is handled app-side (trial_ends_at) — do not add Stripe trial_period_days.
  });

  if (!session.url) return { error: "no checkout url", status: 500 };
  return { url: session.url };
}

/** Stripe Billing Portal (cancel, card, invoices). */
export async function createPortalSession(opts: {
  workspaceId: string;
  locale?: string;
}): Promise<{ url: string } | { error: string; status: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized", status: 401 };

  const locale = opts.locale === "fr" ? "fr" : "en";
  const workspaceId = opts.workspaceId;

  const { data: ownerCheck } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownerCheck?.role !== "owner") {
    return { error: "owner_required", status: 403 };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return { error: "no customer", status: 400 };
  }

  const stripe = getStripe();
  const base = `${appOrigin()}${foodcostBasePath()}`;
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${base}/${locale}/settings/billing`,
  });

  return { url: session.url };
}
