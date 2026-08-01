import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * E2E-only helper: mint a real session and Set-Cookie it via the browser.
 * Query: secret (required), email?, password?, admin=1, redirect?
 */
export async function GET(request: NextRequest) {
  const secret = process.env.E2E_SETUP_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const asAdmin = request.nextUrl.searchParams.get("admin") === "1";
  const email =
    request.nextUrl.searchParams.get("email") ??
    (asAdmin
      ? (process.env.E2E_ADMIN_EMAIL ?? "e2e-admin@example.com")
      : (process.env.E2E_TEST_EMAIL ?? "e2e-goldenpath@example.com"));
  const password =
    request.nextUrl.searchParams.get("password") ??
    (asAdmin
      ? (process.env.E2E_ADMIN_PASSWORD ?? "e2e-Admin-Path-123!")
      : (process.env.E2E_TEST_PASSWORD ?? "e2e-Golden-Path-123!"));
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") ??
    (asAdmin ? "/foodcost/en/admin" : "/foodcost/en/dashboard");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";

  if (!url || !anon || !service) {
    return NextResponse.json({ error: "supabase env missing" }, { status: 500 });
  }

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError && !/already/i.test(createError.message)) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  let userId: string | undefined;
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
  }

  if (asAdmin && userId) {
    await admin.from("profiles").upsert({
      id: userId,
      is_platform_admin: true,
      locale: "en",
    });
  }

  const anonClient = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: signIn, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signIn.session) {
    return NextResponse.json(
      { error: signInError?.message ?? "no session" },
      { status: 500 },
    );
  }

  if (!userId) userId = signIn.user.id;
  if (asAdmin) {
    await admin.from("profiles").upsert({
      id: userId,
      is_platform_admin: true,
      locale: "en",
    });
  }

  const dest = redirectTo.startsWith("http")
    ? redirectTo
    : redirectTo.startsWith(basePath)
      ? redirectTo
      : `${basePath}${redirectTo.startsWith("/") ? "" : "/"}${redirectTo}`;

  const response = new NextResponse(
    `<!doctype html><html><body>
      <p data-testid="e2e-session-ok">session ok</p>
      <script>location.replace(${JSON.stringify(dest)})</script>
    </body></html>`,
    {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );

  const ssr = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error: setError } = await ssr.auth.setSession({
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
  });
  if (setError) {
    return NextResponse.json({ error: setError.message }, { status: 500 });
  }

  return response;
}
