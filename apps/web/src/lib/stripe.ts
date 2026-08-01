import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeSingleton = new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
  return stripeSingleton;
}

/** Typed Stripe price / secret config (never hard-code secrets). */
export function stripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    priceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    priceProYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  };
}

export function stripePriceMonthly(): string {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_MONTHLY;
  if (!id) throw new Error("STRIPE_PRICE_PRO_MONTHLY is not set");
  return id;
}

export function stripePriceYearly(): string | null {
  const id = process.env.STRIPE_PRICE_PRO_YEARLY || process.env.STRIPE_PRICE_YEARLY;
  return id || null;
}

export function hasYearlyPrice(): boolean {
  return !!stripePriceYearly();
}

export function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function foodcostBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
}
