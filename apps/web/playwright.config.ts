import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirName = path.dirname(fileURLToPath(import.meta.url));

// Load local env (Supabase URL/keys) so both the web server and the auth setup
// can reach the same project.
loadEnv({ path: path.resolve(dirName, ".env.local") });
loadEnv({ path: path.resolve(dirName, ".env") });

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
const PORT = Number(process.env.E2E_PORT ?? 3001);
// Trailing slash matters: Playwright resolves `/en/…` against the origin and
// drops a path-only baseURL. Keep the prefix here and use relative gotos
// without a leading slash in specs (e.g. `en/ingredients`).
const BASE_URL = `http://localhost:${PORT}${BASE_PATH}/`;

export default defineConfig({
  testDir: "./e2e",
  // The golden path is a single sequential journey; keep it serial and give it
  // room since it drives real network round-trips to Supabase.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    locale: "en-CA",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      // System Chrome channel — Playwright's bundled Chromium is unavailable on
      // macOS 13 arm64. Auth is established per-test via /api/e2e/session
      // (Set-Cookie); storageState is not used (Chrome drops injected cookies).
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    // Use a non-3000 port: system Chrome on this host refuses to send any
    // cookies to localhost:3000 (document.cookie works, Cookie header is empty).
    command: `npx next dev -p ${PORT}`,
    // `/foodcost` alone 404s (locale required); wait on a real page.
    url: `${BASE_URL}en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
