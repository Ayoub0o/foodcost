import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { applyStripeEvent } from "./webhook-handlers";
import { processStripeWebhookEvent } from "./process-webhook";

function mockAdmin(opts?: { alreadyProcessed?: boolean }) {
  const processed = new Set<string>();
  if (opts?.alreadyProcessed) processed.add("evt_dup");

  const workspacesUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
  const subscriptionsUpsert = vi.fn().mockResolvedValue({});
  const subscriptionsUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
  const subscriptionsSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({
        data: { workspace_id: "ws_1" },
      }),
    }),
  });

  const from = vi.fn((table: string) => {
    if (table === "workspaces") {
      return { update: workspacesUpdate };
    }
    if (table === "subscriptions") {
      return {
        upsert: subscriptionsUpsert,
        update: subscriptionsUpdate,
        select: subscriptionsSelect,
      };
    }
    if (table === "stripe_webhook_events") {
      return {
        select: () => ({
          eq: (_col: string, id: string) => ({
            maybeSingle: async () => ({
              data: processed.has(id) ? { id } : null,
            }),
          }),
        }),
        insert: async (row: { id: string }) => {
          processed.add(row.id);
          return { error: null };
        },
      };
    }
    return {};
  });

  return {
    admin: { from },
    workspacesUpdate,
    subscriptionsUpsert,
    subscriptionsUpdate,
    processed,
  };
}

function evt(type: string, object: unknown, id = `evt_${type}`): Stripe.Event {
  return {
    id,
    type,
    data: { object },
  } as Stripe.Event;
}

describe("applyStripeEvent", () => {
  it("checkout.session.completed sets plan=pro", async () => {
    const { admin, workspacesUpdate, subscriptionsUpsert } = mockAdmin();
    const result = await applyStripeEvent(
      admin,
      evt("checkout.session.completed", {
        mode: "subscription",
        metadata: { workspace_id: "ws_1" },
        customer: "cus_1",
        subscription: "sub_1",
      }),
    );
    expect(result).toMatchObject({ handled: true, action: "checkout_pro", workspaceId: "ws_1" });
    expect(subscriptionsUpsert).toHaveBeenCalled();
    expect(workspacesUpdate).toHaveBeenCalledWith({ plan: "pro" });
  });

  it("customer.subscription.updated active keeps pro", async () => {
    const { admin, workspacesUpdate } = mockAdmin();
    const result = await applyStripeEvent(
      admin,
      evt("customer.subscription.updated", {
        id: "sub_1",
        status: "active",
        customer: "cus_1",
        cancel_at_period_end: false,
        metadata: { workspace_id: "ws_1" },
        items: { data: [{ price: { id: "price_m" } }] },
        current_period_end: 1_800_000_000,
      }),
    );
    expect(result.action).toBe("subscription_pro");
    expect(workspacesUpdate).toHaveBeenCalledWith({ plan: "pro" });
  });

  it("customer.subscription.deleted locks workspace", async () => {
    const { admin, workspacesUpdate } = mockAdmin();
    const result = await applyStripeEvent(
      admin,
      evt("customer.subscription.deleted", {
        id: "sub_1",
        status: "canceled",
        customer: "cus_1",
        cancel_at_period_end: false,
        metadata: { workspace_id: "ws_1" },
        items: { data: [] },
      }),
    );
    expect(result.action).toBe("subscription_locked");
    expect(workspacesUpdate).toHaveBeenCalledWith({ plan: "locked" });
  });

  it("invoice.payment_failed marks past_due", async () => {
    const { admin, subscriptionsUpdate } = mockAdmin();
    const result = await applyStripeEvent(
      admin,
      evt("invoice.payment_failed", {
        customer: "cus_1",
      }),
    );
    expect(result).toMatchObject({ handled: true, action: "payment_failed", workspaceId: "ws_1" });
    expect(subscriptionsUpdate).toHaveBeenCalledWith({ status: "past_due" });
  });
});

describe("processStripeWebhookEvent idempotency", () => {
  it("duplicate event id is a no-op (does not re-apply)", async () => {
    const { admin, workspacesUpdate, processed } = mockAdmin();
    const event = evt(
      "checkout.session.completed",
      {
        mode: "subscription",
        metadata: { workspace_id: "ws_1" },
        customer: "cus_1",
        subscription: "sub_1",
      },
      "evt_dup",
    );

    const first = await processStripeWebhookEvent(admin, event);
    expect(first.duplicate).toBe(false);
    expect(first.action).toBe("checkout_pro");
    expect(processed.has("evt_dup")).toBe(true);
    expect(workspacesUpdate).toHaveBeenCalledTimes(1);

    const second = await processStripeWebhookEvent(admin, event);
    expect(second.duplicate).toBe(true);
    expect(second.action).toBe("duplicate");
    expect(workspacesUpdate).toHaveBeenCalledTimes(1);
  });
});
