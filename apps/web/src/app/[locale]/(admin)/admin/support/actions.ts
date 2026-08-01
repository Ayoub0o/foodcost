"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, writeAuditLog } from "@/lib/admin";
import { sendSupportEmail } from "@/lib/email";
import { appOrigin, foodcostBasePath } from "@/lib/stripe";
import { routing } from "@/i18n/routing";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import type { AppLocale, TicketStatus } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

export async function replyToTicket(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const ticketId = String(formData.get("ticketId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "pending") as TicketStatus;
  const productGap = formData.get("productGap") === "on";

  const admin = await requirePlatformAdmin();
  if (!admin) throw new Error("Forbidden");
  if (!ticketId || body.length < 2) throw new Error("Invalid reply");

  const db = createServiceRoleClient();
  const { data: ticket } = await db.from("support_tickets").select("*").eq("id", ticketId).single();
  if (!ticket) throw new Error("Not found");

  await db.from("support_messages").insert({
    ticket_id: ticketId,
    author: "admin",
    admin_id: admin.userId,
    body,
  });

  await db
    .from("support_tickets")
    .update({
      status: ["open", "pending", "resolved"].includes(status) ? status : "pending",
      product_gap: productGap,
      assigned_admin_id: admin.userId,
    })
    .eq("id", ticketId);

  const ticketUrl = `${appOrigin()}${foodcostBasePath()}/${locale}/support?ticket=${ticketId}`;
  await sendSupportEmail({
    to: ticket.email,
    locale: locale,
    kind: "support_admin_reply",
    subject: ticket.subject,
    body,
    ticketRef: ticketId,
    ticketUrl,
  });

  await writeAuditLog({
    actorUserId: admin.userId,
    action: "support_reply",
    targetType: "support_ticket",
    targetId: ticketId,
    meta: { email: ticket.email, status },
  });

  revalidatePath(`/${locale}/admin/support`);
  revalidatePath(`/${locale}/admin/support/${ticketId}`);
  revalidatePath(`/${locale}/admin/audit`);
}

export async function createSupportTicket(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "question");
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot) return { ok: true as const }; // bot

  const hdrs = await headers();
  const limited = rateLimit({
    key: `support:create:${clientIpFromHeaders(hdrs)}`,
    limit: 8,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) throw new Error("Rate limited");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Unauthorized");
  if (subject.length < 3 || body.length < 5) throw new Error("Invalid");

  const { data: ws } = await supabase
    .from("workspaces")
    .select("id,plan,locale")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      workspace_id: ws?.id ?? null,
      user_id: user.id,
      email: user.email,
      subject,
      body,
      category,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !ticket) throw new Error(error?.message ?? "Failed");

  await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    author: "user",
    body,
  });

  const ticketUrl = `${appOrigin()}${foodcostBasePath()}/${locale}/support?ticket=${ticket.id}`;
  await sendSupportEmail({
    to: user.email,
    locale,
    kind: "support_ticket_created",
    subject,
    body: locale === "fr"
      ? `Nous avons bien reçu votre demande.\n\n${body}`
      : `We received your request.\n\n${body}`,
    ticketRef: ticket.id,
    ticketUrl,
  });

  const notify = process.env.SUPPORT_NOTIFY_EMAIL ?? process.env.ADMIN_EMAILS?.split(",")[0];
  if (notify) {
    await sendSupportEmail({
      to: notify.trim(),
      locale: "en",
      kind: "support_admin_notify",
      subject,
      body: `From: ${user.email}\nWorkspace: ${ws?.id ?? "—"}\nPlan: ${ws?.plan ?? "—"}\n\n${body}`,
      ticketRef: ticket.id,
    });
  }

  revalidatePath(`/${locale}/admin/support`);
  revalidatePath(`/${locale}/support`);
  return { ok: true as const, ticketId: ticket.id };
}
