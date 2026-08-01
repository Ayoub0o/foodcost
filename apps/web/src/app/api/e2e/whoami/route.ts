import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { e2eDisabledResponse } from "@/lib/e2e-guard";

/** E2E debug: echo whether the auth cookie is visible and getUser succeeds. */
export async function GET(request: NextRequest) {
  const disabled = e2eDisabledResponse();
  if (disabled) return disabled;

  const secret = process.env.E2E_SETUP_SECRET;
  if (!secret || request.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const hasAuth = cookieNames.some((n) => n.includes("auth-token"));
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({
    cookieNames,
    hasAuth,
    user: user?.email ?? null,
    error: error?.message ?? null,
  });
}
