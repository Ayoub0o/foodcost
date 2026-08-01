import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // FoodCost is served under the /foodcost subdirectory of pixplat.com to inherit
  // the domain's authority and backlinks (PRD hard rule). A reverse proxy may
  // strip this in some deploys; keep it configurable via env.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost",
  transpilePackages: ["@foodcost/costing-engine"],
  // Pin the workspace root so Next.js ignores unrelated parent lockfiles.
  outputFileTracingRoot: resolve(__dirname, "../.."),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

const intlConfig = withNextIntl(nextConfig);

export default withSentryConfig(intlConfig, {
  // Silent when no auth token / org — local builds stay green without Sentry cloud.
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: undefined,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
