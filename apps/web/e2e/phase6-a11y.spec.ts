import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test("app shell: skip link reaches main content", async ({ page }) => {
  test.setTimeout(90_000);
  await signIn(page);
  await page.goto("en/dashboard");
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });

  await page.keyboard.press("Tab");
  const skip = page.locator('a[href="#main-content"]').first();
  await expect(skip).toBeFocused({ timeout: 5_000 });
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("marketing: skip link + main landmark present", async ({ page }) => {
  await page.goto("en");
  await expect(page.locator("#main-content")).toBeVisible();
  await page.keyboard.press("Tab");
  const skip = page.locator('a[href="#main-content"]').first();
  await expect(skip).toBeFocused({ timeout: 5_000 });
});
