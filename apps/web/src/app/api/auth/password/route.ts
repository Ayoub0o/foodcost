import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Password sign-in that sets auth cookies on the HTTP redirect response.
 * More reliable than Server Actions for persisting the Supabase session cookie.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const locale = String(form.get("locale") ?? "en");
  const nextRaw = String(form.get("next") ?? "").trim();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
  const origin = new URL(request.url).origin;

  const fail = () =>
    NextResponse.redirect(new URL(`${basePath}/${locale}/login?error=credentials`, origin), 303);

  if (!email || password.length < 6) return fail();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const authClient = createAdminClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return fail();

  const admin = createAdminClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const bootstrap = adminEmails.includes(email.toLowerCase());
  if (bootstrap) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      is_platform_admin: true,
      locale: locale === "fr" ? "fr" : "en",
    });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("is_platform_admin")
    .eq("id", data.user.id)
    .maybeSingle();
  const isAdmin = !!profile?.is_platform_admin || bootstrap;

  let destPath = nextRaw || (isAdmin ? `/${locale}/admin` : `/${locale}/dashboard`);
  if (!destPath.startsWith("/")) destPath = `/${locale}/dashboard`;
  if (!destPath.startsWith(basePath)) destPath = `${basePath}${destPath}`;

  const response = NextResponse.redirect(new URL(destPath, origin), 303);

  const ssr = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
        }
      },
    },
  });

  const { error: setError } = await ssr.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (setError) return fail();

  return response;
}
