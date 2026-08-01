import { test, expect, type Page } from "@playwright/test";
import { signIn } from "./helpers/auth";

/**
 * Phase 2 golden path (DIRECTIVE §11 accept):
 *   "signup → 3 ingredients → 1 recipe → correct FC% shown".
 *
 * Auth: magic-link/OAuth can't be automated offline, so we mint a session via
 * `/api/e2e/session` and attach the Cookie header on every request (Chrome +
 * Playwright on this host drops jar cookies for the Next origin).
 *
 * Deterministic data (all yields 100%):
 *   Beef   1000 g @ $10.00 → 1.00¢/g;  use 200 g → 200¢
 *   Bun      10 u @  $5.00 → 50¢/unit; use   1 u →  50¢
 *   Cheese  500 g @ $10.00 → 2.00¢/g;  use  25 g →  50¢
 *   Total per portion = 300¢; menu price = $12.00 → FC% = 300/1200 = 25.0%
 */

const RUN = Date.now();
const NAMES = {
  beef: `E2E Beef ${RUN}`,
  bun: `E2E Bun ${RUN}`,
  cheese: `E2E Cheese ${RUN}`,
  recipe: `E2E Burger ${RUN}`,
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
  // Drawer closes once the mutation resolves.
  await expect(page.getByTestId("ingredient-save")).toHaveCount(0);
  await expect(page.getByText(opts.name, { exact: false })).toBeVisible();
}

test("golden path: 3 ingredients → 1 recipe → 25% food cost", async ({ page }) => {
  test.setTimeout(120_000);

  // 0) Signup precondition — session via server Set-Cookie
  await signIn(page);

  // 1) Ingredients — relative to baseURL (…/foodcost/), no leading slash
  await page.goto("en/ingredients");
  await expect(page).toHaveURL(/\/foodcost\/en\/ingredients/);
  await expect(page.getByTestId("ingredient-new")).toBeVisible({ timeout: 30_000 });
  await addIngredient(page, { name: NAMES.beef, baseUnit: "g", qty: "1000", unit: "g", price: "10.00" });
  await addIngredient(page, { name: NAMES.bun, baseUnit: "unit", qty: "10", unit: "unit", price: "5.00" });
  await addIngredient(page, { name: NAMES.cheese, baseUnit: "g", qty: "500", unit: "g", price: "10.00" });

  // 2) Create a recipe (redirects to the editor)
  await page.goto("en/recipes");
  await page.getByTestId("recipe-new").click();
  await expect(page).toHaveURL(/\/foodcost\/en\/recipes\/[0-9a-f-]{36}$/);

  // 3) Fill recipe header
  await page.getByTestId("recipe-name").fill(NAMES.recipe);
  await page.getByTestId("recipe-portions").fill("1");
  await page.getByTestId("recipe-menuPrice").fill("12.00");

  // 4) Add the three items (unit defaults to the ingredient's base dimension)
  const items = [
    { name: NAMES.beef, qty: "200" },
    { name: NAMES.bun, qty: "1" },
    { name: NAMES.cheese, qty: "25" },
  ];
  for (const item of items) {
    await page.getByTestId("recipe-add-item").click();
    const row = page.getByTestId("recipe-item-row").last();
    await row.getByTestId("recipe-item-ingredient").selectOption({ label: item.name });
    await row.getByTestId("recipe-item-qty").fill(item.qty);
  }

  // 5) Live cost panel shows the correct FC% before saving
  await expect(page.getByTestId("cost-fc")).toContainText("25.0");

  // 6) Save → back to the list, where the cached FC% must match
  await page.getByTestId("recipe-save").click();
  await expect(page).toHaveURL(/\/foodcost\/en\/recipes\/?$/);

  const row = page.getByRole("row", { name: new RegExp(NAMES.recipe) });
  await expect(row).toContainText("25.0");
});
