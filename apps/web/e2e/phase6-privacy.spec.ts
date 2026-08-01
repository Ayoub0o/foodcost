import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

/**
 * Global DoD: data export + workspace soft-deletion (DIRECTIVE §10 / §12).
 * Uses an ephemeral user so the golden-path account is never deleted.
 */

const RUN = Date.now();
const EMAIL = `e2e-privacy-${RUN}@example.com`;
const PASSWORD = "e2e-Privacy-Path-123!";

test("settings: export all my data (JSON)", async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page, { email: EMAIL, password: PASSWORD });

  await page.goto("en/settings");
  await expect(page.getByTestId("privacy-section")).toBeVisible({ timeout: 30_000 });

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-all-data").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/foodcost-workspace-.*\.json/);

  const path = await download.path();
  expect(path).toBeTruthy();
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(path!, "utf8");
  const json = JSON.parse(raw) as {
    exported_at?: string;
    workspace?: { id?: string };
    ingredients?: unknown[];
  };
  expect(json.exported_at).toBeTruthy();
  expect(json.workspace?.id).toBeTruthy();
  expect(Array.isArray(json.ingredients)).toBe(true);
});

test("settings: soft-delete workspace after name confirm", async ({ page }) => {
  test.setTimeout(120_000);
  const email = `e2e-delete-${RUN}@example.com`;
  await signIn(page, { email, password: PASSWORD });

  await page.goto("en/settings");
  await expect(page.getByTestId("privacy-section")).toBeVisible({ timeout: 30_000 });

  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();
  const workspaceName = await nameInput.inputValue();
  expect(workspaceName.length).toBeGreaterThan(0);

  await page.getByTestId("delete-confirm-name").fill(workspaceName);
  await page.getByTestId("delete-workspace").click();

  await expect(page).toHaveURL(/deleted=1/, { timeout: 30_000 });
  await expect(page.getByTestId("workspace-deleted-banner")).toBeVisible();

  // Signed out — app routes should bounce to login.
  await page.goto("en/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
});
