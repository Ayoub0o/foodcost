"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/admin";
import { recomputeWorkspace } from "@/lib/costing/service";
import { getCurrentUserWorkspace, isWorkspaceReadOnly } from "@/lib/workspace";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  currency: z.enum(["CAD", "USD", "EUR"]),
  locale: z.enum(["en", "fr"]),
  targetFc: z.coerce.number().min(1).max(99),
  vatMode: z.enum(["ht", "ttc"]),
});

export async function updateWorkspaceSettings(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) {
    redirect(`/${locale}/settings?readonly=1`);
  }

  const data = schema.parse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    locale: formData.get("wsLocale"),
    targetFc: formData.get("targetFc"),
    vatMode: formData.get("vatMode"),
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      name: data.name,
      currency: data.currency,
      locale: data.locale,
      target_food_cost_pct: data.targetFc,
      vat_mode: data.vatMode,
    })
    .eq("id", session.workspace.id);

  if (error) throw new Error(error.message);

  await recomputeWorkspace(session.workspace.id);
  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/settings?saved=1`);
}

/**
 * Soft-delete workspace after typing its name (DIRECTIVE §10).
 * Hard purge runs via `/api/cron/purge` after 30 days.
 */
export async function softDeleteWorkspace(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const confirmName = String(formData.get("confirmName") ?? "").trim();
  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (session.impersonating) throw new Error("Cannot delete while impersonating");

  if (confirmName !== session.workspace.name) {
    redirect(`/${locale}/settings?deleteError=1`);
  }

  // Owner-only.
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", session.workspace.id)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (membership?.role !== "owner") {
    redirect(`/${locale}/settings?deleteError=1`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("workspaces")
    .update({ deleted_at: now })
    .eq("id", session.workspace.id);
  if (error) throw new Error(error.message);

  // Anonymize support tickets for this user/workspace (privacy).
  const admin = createServiceRoleClient();
  await admin
    .from("support_tickets")
    .update({ email: "deleted-user", user_id: null })
    .eq("workspace_id", session.workspace.id);

  await writeAuditLog({
    actorUserId: session.user.id,
    action: "workspace.soft_delete",
    targetType: "workspace",
    targetId: session.workspace.id,
    meta: { name: session.workspace.name },
  });

  await supabase.auth.signOut();
  redirect(`/${locale}?deleted=1`);
}
