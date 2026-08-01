import { cache } from "react";
import { cookies } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { ProfileRow, WorkspaceRow } from "@/lib/supabase/database.types";

export const IMPERSONATE_COOKIE = "fc_impersonate_workspace";

export interface AdminSession {
  userId: string;
  email: string;
  profile: ProfileRow;
}

/** Ensure ADMIN_EMAILS bootstrap flag is applied (DIRECTIVE §4). */
export async function ensureAdminFlag(userId: string, email: string | undefined): Promise<boolean> {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const admin = createServiceRoleClient();

  if (email && list.includes(email.toLowerCase())) {
    await admin.from("profiles").upsert({
      id: userId,
      is_platform_admin: true,
    });
    return true;
  }

  const { data } = await admin
    .from("profiles")
    .select("is_platform_admin")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.is_platform_admin;
}

/** Request-scoped: layout + admin pages share one admin check. */
export const requirePlatformAdmin = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ok = await ensureAdminFlag(user.id, user.email);
  if (!ok) return null;

  const svc = createServiceRoleClient();
  const { data: profile } = await svc.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile?.is_platform_admin) return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: profile as ProfileRow,
  };
});

export async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}) {
  const admin = createServiceRoleClient();
  await admin.from("audit_log").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    meta: input.meta ?? {},
  });
}

export async function getImpersonatedWorkspaceId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(IMPERSONATE_COOKIE)?.value ?? null;
}

export async function loadWorkspaceById(id: string): Promise<WorkspaceRow | null> {
  const admin = createServiceRoleClient();
  const { data } = await admin.from("workspaces").select("*").eq("id", id).maybeSingle();
  return (data as WorkspaceRow | null) ?? null;
}
