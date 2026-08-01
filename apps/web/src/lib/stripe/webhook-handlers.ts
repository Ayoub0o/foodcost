import type Stripe from "stripe";

export type AdminDb = {
  from: (table: string) => any;
};

export interface WebhookHandleResult {
  handled: boolean;
  workspaceId?: string;
  action?: string;
}

/**
 * Pure Stripe event application logic (testable without Next.js).
 * Callers own idempotency (stripe_webhook_events) and persistence of the event row.
 */
export async function applyStripeEvent(
  admin: AdminDb,
  event: Stripe.Event,
): Promise<WebhookHandleResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId =
        session.metadata?.workspace_id ?? session.client_reference_id ?? undefined;
      if (!workspaceId || session.mode !== "subscription") {
        return { handled: false };
      }
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      await upsertSubscription(admin, workspaceId, {
        stripe_customer_id: customerId ?? null,
        stripe_subscription_id: subscriptionId ?? null,
        status: "active",
      });
      await admin.from("workspaces").update({ plan: "pro" }).eq("id", workspaceId);
      return { handled: true, workspaceId, action: "checkout_pro" };
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspace_id;
      if (!workspaceId) return { handled: false };
      const status = sub.status;
      const periodEndRaw = (sub as unknown as { current_period_end?: number }).current_period_end;
      const periodEnd = typeof periodEndRaw === "number" ? periodEndRaw : null;
      await upsertSubscription(admin, workspaceId, {
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripe_subscription_id: sub.id,
        status,
        price_id: sub.items.data[0]?.price.id ?? null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
      });
      if (status === "active" || status === "trialing") {
        await admin.from("workspaces").update({ plan: "pro" }).eq("id", workspaceId);
        return { handled: true, workspaceId, action: "subscription_pro" };
      }
      if (
        status === "canceled" ||
        status === "unpaid" ||
        event.type === "customer.subscription.deleted"
      ) {
        await admin.from("workspaces").update({ plan: "locked" }).eq("id", workspaceId);
        return { handled: true, workspaceId, action: "subscription_locked" };
      }
      return { handled: true, workspaceId, action: "subscription_synced" };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) return { handled: false };
      const { data: row } = await admin
        .from("subscriptions")
        .select("workspace_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (!row) return { handled: false };
      await admin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("workspace_id", row.workspace_id);
      // Final failures typically arrive as subscription.updated → unpaid/canceled (lock).
      return { handled: true, workspaceId: row.workspace_id, action: "payment_failed" };
    }
    default:
      return { handled: false };
  }
}

async function upsertSubscription(
  admin: AdminDb,
  workspaceId: string,
  patch: Record<string, unknown>,
) {
  await admin.from("subscriptions").upsert(
    {
      workspace_id: workspaceId,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );
}
