"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  IMPERSONATE_COOKIE,
  requirePlatformAdmin,
  writeAuditLog,
} from "@/lib/admin";
import { routing } from "@/i18n/routing";
import type { AppLocale, WorkspacePlan } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

export async function extendTrial(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const admin = await requirePlatformAdmin();
  if (!admin) throw new Error("Forbidden");
  if (!workspaceId) throw new Error("Missing workspace");

  const db = createServiceRoleClient();
  const { data: ws } = await db.from("workspaces").select("*").eq("id", workspaceId).single();
  if (!ws) throw new Error("Not found");

  const base = new Date(ws.trial_ends_at);
  const from = base.getTime() < Date.now() ? new Date() : base;
  const next = new Date(from.getTime() + 7 * 86400000);

  await db
    .from("workspaces")
    .update({
      trial_ends_at: next.toISOString(),
      plan: ws.plan === "locked" ? "trialing" : ws.plan,
    })
    .eq("id", workspaceId);

  await writeAuditLog({
    actorUserId: admin.userId,
    action: "extend_trial",
    targetType: "workspace",
    targetId: workspaceId,
    meta: { days: 7, trial_ends_at: next.toISOString() },
  });

  revalidatePath(`/${locale}/admin/customers`);
  revalidatePath(`/${locale}/admin/customers/${workspaceId}`);
  revalidatePath(`/${locale}/admin/audit`);
}

export async function setWorkspacePlan(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const admin = await requirePlatformAdmin();
  if (!admin) throw new Error("Forbidden");
  if (!workspaceId || !["trialing", "pro", "locked"].includes(plan)) {
    throw new Error("Invalid");
  }
  const nextPlan = plan as WorkspacePlan;

  const db = createServiceRoleClient();
  const { error } = await db.from("workspaces").update({ plan: nextPlan }).eq("id", workspaceId);
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorUserId: admin.userId,
    action: plan === "locked" ? "lock_workspace" : plan === "pro" ? "comp_plan" : "unlock_workspace",
    targetType: "workspace",
    targetId: workspaceId,
    meta: { plan: nextPlan },
  });

  revalidatePath(`/${locale}/admin/customers`);
  revalidatePath(`/${locale}/admin/customers/${workspaceId}`);
  revalidatePath(`/${locale}/admin/audit`);
}

export async function startImpersonation(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const admin = await requirePlatformAdmin();
  if (!admin) throw new Error("Forbidden");

  const db = createServiceRoleClient();
  const { data: ws } = await db.from("workspaces").select("id,name").eq("id", workspaceId).single();
  if (!ws) throw new Error("Not found");

  const jar = await cookies();
  jar.set(IMPERSONATE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  await writeAuditLog({
    actorUserId: admin.userId,
    action: "impersonate_start",
    targetType: "workspace",
    targetId: workspaceId,
    meta: { workspaceName: ws.name },
  });

  redirect(`/${locale}/dashboard`);
}

export async function stopImpersonation(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const admin = await requirePlatformAdmin();
  const jar = await cookies();
  const workspaceId = jar.get(IMPERSONATE_COOKIE)?.value;
  jar.delete(IMPERSONATE_COOKIE);

  if (admin && workspaceId) {
    await writeAuditLog({
      actorUserId: admin.userId,
      action: "impersonate_end",
      targetType: "workspace",
      targetId: workspaceId,
    });
  }

  redirect(`/${locale}/admin/customers${workspaceId ? `/${workspaceId}` : ""}`);
}
