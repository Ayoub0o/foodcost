import { test as setup } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signIn } from "./helpers/auth";

const dirName = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE = path.resolve(dirName, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  setup.skip(
    !process.env.E2E_SETUP_SECRET ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY,
    "E2E_SETUP_SECRET / Supabase env not configured. See e2e/README.",
  );

  await signIn(page);

  mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
