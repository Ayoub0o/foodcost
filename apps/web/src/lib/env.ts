/**
 * Deployment / indexing environment helpers.
 *
 * Production is indexable by default. Preview, staging, and local are noindex
 * unless NEXT_PUBLIC_ALLOW_INDEXING=true is explicitly set.
 */
export function allowSearchIndexing(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true") return true;
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "false") return false;
  const foodcostEnv = process.env.FOODCOST_ENV;
  if (foodcostEnv === "staging" || foodcostEnv === "preview" || foodcostEnv === "development") {
    return false;
  }
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  if (foodcostEnv === "production" || process.env.VERCEL_ENV === "production") return true;
  return process.env.NODE_ENV === "production";
}

export function appVersion(): string {
  return process.env.npm_package_version ?? process.env.APP_VERSION ?? "0.1.0";
}

/** E2E helper routes must never be reachable in production without a secret AND flag. */
export function e2eRoutesEnabled(): boolean {
  if (!process.env.E2E_SETUP_SECRET) return false;
  if (process.env.FOODCOST_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return process.env.ALLOW_E2E_ROUTES === "true";
  }
  return true;
}
