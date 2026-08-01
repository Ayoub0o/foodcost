import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { seedSampleWorkspace } from "@/lib/seed";
import {
  getImpersonatedWorkspaceId,
  loadWorkspaceById,
  requirePlatformAdmin,
} from "@/lib/admin";
import type { AppLocale, WorkspaceRow } from "@/lib/supabase/database.types";

/**
 * Return the current user's first workspace, creating (and seeding) a starter
 * one on first login so no user ever lands on an empty account
 * (DIRECTIVE §5.2 sample workspace).
 *
 * Concurrent first loads can race; unique index `uniq_workspaces_owner_active`
 * + re-select on conflict keeps a single active workspace per owner.
 */
export async function getOrCreateWorkspace(
  locale: AppLocale,
  user: User,
): Promise<WorkspaceRow | null> {
  const supabase = await createClient();

  const existing = await loadActiveWorkspace(supabase);
  if (existing) return existing;

  const defaultName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    (locale === "fr" ? "Mon restaurant" : "My restaurant");

  const { data: created, error } = await supabase
    .from("workspaces")
    .insert({ name: defaultName, owner_id: user.id, locale })
    .select("*")
    .single();

  if (error || !created) {
    // Unique violation / race: another request created the workspace first.
    const raced = await loadActiveWorkspace(supabase);
    if (raced) return raced;
    return null;
  }

  await supabase
    .from("memberships")
    .insert({ workspace_id: created.id, user_id: user.id, role: "owner" });

  try {
    await seedSampleWorkspace(created.id, locale);
  } catch {
    // ignore — user can still add their own data
  }

  if (user.email) {
    try {
      const { sendTransactionalEmail } = await import("@/lib/email");
      await sendTransactionalEmail({
        to: user.email,
        locale,
        kind: "d0_welcome",
        workspaceName: created.name,
      });
    } catch {
      // ignore — onboarding must not fail on email
    }
  }

  return created;
}

async function loadActiveWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<WorkspaceRow | null> {
  const { data: existing } = await supabase
    .from("workspaces")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);

  return existing?.[0] ?? null;
}

export interface UserWorkspace {
  user: User;
  workspace: WorkspaceRow;
  /** True when a platform admin is viewing another workspace (read-only). */
  impersonating?: boolean;
}

/**
 * Load the signed-in user and their workspace for an app page.
 * Request-scoped via React.cache so layout + page share one resolution.
 */
export const getCurrentUserWorkspace = cache(
  async (locale: AppLocale): Promise<UserWorkspace | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const impersonateId = await getImpersonatedWorkspaceId();
    if (impersonateId) {
      const admin = await requirePlatformAdmin();
      if (admin) {
        const workspace = await loadWorkspaceById(impersonateId);
        if (workspace) {
          return { user, workspace, impersonating: true };
        }
      }
    }

    const workspace = await getOrCreateWorkspace(locale, user);
    if (!workspace) return null;

    return { user, workspace, impersonating: false };
  },
);

/** A workspace is read-only when the plan is locked (trial expired / unpaid). */
export function isWorkspaceLocked(workspace: WorkspaceRow): boolean {
  return workspace.plan === "locked";
}

/** Mutations are blocked while impersonating or when the plan is locked. */
export function isWorkspaceReadOnly(session: UserWorkspace): boolean {
  return !!session.impersonating || isWorkspaceLocked(session.workspace);
}
