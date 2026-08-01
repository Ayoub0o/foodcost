import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { routing } from "@/i18n/routing";

function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
  if (path.startsWith(base)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Auth callback: exchanges the `code` (magic link or OAuth) for a session and
 * redirects to `next`. Cookies are written onto the redirect response.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${routing.defaultLocale}/dashboard`;

  const redirectTo = new URL(withBasePath(next.startsWith("/") ? next : `/${next}`), origin);
  const response = NextResponse.redirect(redirectTo);

  if (!code) {
    return NextResponse.redirect(
      new URL(withBasePath(`/${routing.defaultLocale}/login?error=code`), origin),
    );
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(withBasePath(`/${routing.defaultLocale}/login?error=exchange`), origin),
    );
  }

  return response;
}
