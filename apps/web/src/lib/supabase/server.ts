import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server Supabase client bound to the request cookies (RLS-scoped to the signed-in
 * user via the anon key). Request-scoped via React.cache.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The middleware refresh path handles session persistence.
          }
        },
      },
    },
  );
});

/**
 * Service-role Supabase client. SERVER-ONLY. Bypasses RLS — use exclusively in
 * trusted server code (webhooks, cron, admin actions) and always pair sensitive
 * writes with an audit_log entry (DIRECTIVE §3/§7).
 *
 * Uses @supabase/supabase-js (not the SSR cookie client) so the service key is
 * never mixed with an end-user session JWT.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
