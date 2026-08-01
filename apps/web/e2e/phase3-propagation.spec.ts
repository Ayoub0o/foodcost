import { test, expect, type Page } from "@playwright/test";
import ExcelJS from "exceljs";
import { signIn } from "./helpers/auth";

/**
 * Phase 3 accept (DIRECTIVE §11):
 *   "price change crosses threshold → alert visible → xlsx export contains updated numbers"
 *
 * Setup (deterministic, target FC 30%):
 *   Beef 1000 g @ $10 → use 200 g = 200¢
 *   Bun    10 u @  $5 → use   1 u =  50¢
 *   Cheese 500 g @ $10 → use  25 g =  50¢
 *   Total 300¢ / menu $12 → FC% = 25% (under target)
 *
 * Then raise Beef to $20 → 400¢ + 100¢ = 500¢ / 1200 → FC% ≈ 41.67% (crosses 30%).
 */

const RUN = Date.now();
const NAMES = {
  beef: `P3 Beef ${RUN}`,
  bun: `P3 Bun ${RUN}`,
  cheese: `P3 Cheese ${RUN}`,
  recipe: `P3 Burger ${RUN}`,
};

async function addIngredient(
  page: Page,
  opts: { name: string; baseUnit: string; qty: string; unit: string; price: string },
) {
  await page.getByTestId("ingredient-new").click();
  await page.getByTestId("ingredient-name").fill(opts.name);
  await page.getByTestId("ingredient-baseUnit").selectOption(opts.baseUnit);
  await page.getByTestId("ingredient-purchaseQty").fill(opts.qty);
  await page.getByTestId("ingredient-purchaseUnit").selectOption(opts.unit);
  await page.getByTestId("ingredient-purchasePrice").fill(opts.price);
  await page.getByTestId("ingredient-save").click();
  await expect(page.getByTestId("ingredient-save")).toHaveCount(0);
  await expect(page.getByText(opts.name, { exact: false })).toBeVisible();
}

test("price change crosses threshold → alert → profitability xlsx", async ({ page }) => {
  test.setTimeout(180_000);

  await signIn(page);

  // Ensure target FC is 30% so 25→41.67 crosses.
  await page.goto("en/settings");
  await page.locator('input[name="targetFc"]').fill("30");
  await page.getByRole("button", { name: /save|enregistrer/i }).click();
  await expect(page.getByText(/saved|enregistrés/i)).toBeVisible({ timeout: 15_000 });

  await page.goto("en/ingredients");
  await expect(page.getByTestId("ingredient-new")).toBeVisible({ timeout: 30_000 });
  await addIngredient(page, { name: NAMES.beef, baseUnit: "g", qty: "1000", unit: "g", price: "10.00" });
  await addIngredient(page, { name: NAMES.bun, baseUnit: "unit", qty: "10", unit: "unit", price: "5.00" });
  await addIngredient(page, { name: NAMES.cheese, baseUnit: "g", qty: "500", unit: "g", price: "10.00" });

  await page.goto("en/recipes");
  await page.getByTestId("recipe-new").click();
  await expect(page).toHaveURL(/\/foodcost\/en\/recipes\/[0-9a-f-]{36}$/);
  await page.getByTestId("recipe-name").fill(NAMES.recipe);
  await page.getByTestId("recipe-portions").fill("1");
  await page.getByTestId("recipe-menuPrice").fill("12.00");
  for (const item of [
    { name: NAMES.beef, qty: "200" },
    { name: NAMES.bun, qty: "1" },
    { name: NAMES.cheese, qty: "25" },
  ]) {
    await page.getByTestId("recipe-add-item").click();
    const row = page.getByTestId("recipe-item-row").last();
    await row.getByTestId("recipe-item-ingredient").selectOption({ label: item.name });
    await row.getByTestId("recipe-item-qty").fill(item.qty);
  }
  await expect(page.getByTestId("cost-fc")).toContainText("25.0");
  await page.getByTestId("recipe-save").click();
  await expect(page).toHaveURL(/\/foodcost\/en\/recipes\/?$/);

  // Raise beef price → crosses threshold.
  await page.goto("en/ingredients");
  const beefRow = page.getByRole("row", { name: new RegExp(NAMES.beef) });
  await beefRow.getByRole("button", { name: /edit|modifier/i }).click();
  await page.getByTestId("ingredient-purchasePrice").fill("20.00");
  await page.getByTestId("ingredient-save").click();

  await expect(page.getByTestId("toast")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("toast")).toContainText(/1/);

  // Alert on Overview
  await page.goto("en/dashboard");
  await expect(page.getByTestId("alerts-panel")).toBeVisible();
  await expect(page.getByTestId("alert-row").first()).toContainText(NAMES.recipe, {
    timeout: 15_000,
  });

  // Profitability export contains the updated FC%
  await page.goto("en/reports");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-profitability").click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path!);
  const sheet = workbook.getWorksheet("Profitability") ?? workbook.worksheets[0];
  expect(sheet).toBeTruthy();

  let found = false;
  sheet!.eachRow((row) => {
    const name = String(row.getCell(1).value ?? "");
    const fc = row.getCell(5).value;
    if (name.includes(NAMES.recipe)) {
      found = true;
      const n = typeof fc === "number" ? fc : Number(fc);
      expect(n).toBeGreaterThan(40);
      expect(n).toBeLessThan(43);
    }
  });
  expect(found).toBe(true);
});

test("stripe webhook event ids are replay-safe", async ({ request }) => {
  const secret = process.env.E2E_SETUP_SECRET;
  expect(secret).toBeTruthy();
  // Relative to baseURL (…/foodcost/), not origin root.
  const res = await request.post(`api/e2e/webhook-idempotency?secret=${secret}`);
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { duplicateBlocked?: boolean };
  expect(body.duplicateBlocked).toBe(true);
});
