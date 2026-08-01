import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

/**
 * Global DoD: lock state still allows exports (PRD guarantee / §12).
 */

const RUN = Date.now();
const EMAIL = `e2e-lock-${RUN}@example.com`;
const PASSWORD = "e2e-Lock-Path-123!";

test("locked workspace: editing blocked, JSON + xlsx export still work", async ({ browser }) => {
  test.setTimeout(180_000);

  const userCtx = await browser.newContext();
  const userPage = await userCtx.newPage();
  await signIn(userPage, { email: EMAIL, password: PASSWORD });
  // Single navigation after auth — avoids dual getOrCreateWorkspace races on first paint.
  await userPage.goto("en/settings");
  await expect(userPage.getByTestId("privacy-section")).toBeVisible({ timeout: 30_000 });
  await expect(userPage.getByTestId("billing-card")).toBeVisible();
  await userCtx.close();

  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  await signIn(adminPage, { admin: true });
  await adminPage.goto("en/admin/customers");
  await expect(adminPage.getByTestId("admin-customers-table")).toBeVisible({ timeout: 30_000 });
  await adminPage.getByTestId("admin-customer-search").fill(EMAIL);
  await adminPage.getByTestId("admin-customer-search").press("Enter");
  await expect(adminPage.getByTestId("admin-customer-row").first()).toBeVisible({ timeout: 15_000 });
  await adminPage.getByTestId("admin-customer-open").first().click();
  await expect(adminPage.getByTestId("admin-customer-detail")).toBeVisible();
  await adminPage.getByTestId("admin-lock").click();
  await expect(adminPage.getByTestId("admin-customer-detail")).toBeVisible({ timeout: 15_000 });
  await adminPage.reload();
  await expect(adminPage.getByTestId("admin-customer-detail")).toContainText(/locked/i, {
    timeout: 15_000,
  });
  await adminCtx.close();

  const lockedCtx = await browser.newContext();
  const lockedPage = await lockedCtx.newPage();
  await signIn(lockedPage, { email: EMAIL, password: PASSWORD });

  // Trial pill / billing should reflect locked
  await lockedPage.goto("en/settings");
  await expect(lockedPage.getByTestId("billing-card")).toContainText(
    /trial ended|essai terminé|read-only|lecture seule/i,
    { timeout: 15_000 },
  );

  // Mutations rejected (settings save while locked)
  await lockedPage.locator('input[name="targetFc"]').fill("33");
  await lockedPage.getByRole("button", { name: /save|enregistrer/i }).click();
  await expect(lockedPage).toHaveURL(/readonly=1/, { timeout: 15_000 });
  await expect(lockedPage.getByText(/settings saved|paramètres enregistrés/i)).toHaveCount(0);

  // Portability export still works
  const jsonDownload = lockedPage.waitForEvent("download");
  await lockedPage.getByTestId("export-all-data").click();
  const json = await jsonDownload;
  expect(json.suggestedFilename()).toMatch(/\.json$/);

  // Excel export still works
  await lockedPage.goto("en/reports");
  const xlsxDownload = lockedPage.waitForEvent("download");
  await lockedPage.getByTestId("export-profitability").click();
  const xlsx = await xlsxDownload;
  expect(xlsx.suggestedFilename()).toMatch(/\.xlsx$/i);

  await lockedCtx.close();
});
