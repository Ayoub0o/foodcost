import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { allowSearchIndexing } from "./lib/env";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

/** Paths that need cookie session refresh (app / admin / auth). Public SEO pages skip Auth round-trip. */
function needsSessionRefresh(pathname: string): boolean {
  const stripped = pathname.replace(/^\/foodcost(?=\/|$)/, "") || "/";
  const withoutLocale = stripped.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  const prefixes = [
    "/dashboard",
    "/ingredients",
    "/recipes",
    "/settings",
    "/reports",
    "/profitability",
    "/support",
    "/admin",
    "/login",
  ];
  // /settings/billing covered by /settings prefix
  return prefixes.some((p) => withoutLocale === p || withoutLocale.startsWith(`${p}/`));
}

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  if (needsSessionRefresh(request.nextUrl.pathname)) {
    await updateSession(request, response);
  }

  // Request-time noindex for staging/preview (build-time robots metadata is insufficient).
  if (!allowSearchIndexing()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
