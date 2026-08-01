import { expect, type Page } from "@playwright/test";

export async function signIn(
  page: Page,
  opts?: { admin?: boolean; email?: string; password?: string; redirect?: string },
) {
  const secret = process.env.E2E_SETUP_SECRET;
  if (!secret) {
    throw new Error("E2E_SETUP_SECRET not configured");
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
  const port = process.env.E2E_PORT ?? "3001";
  const origin = `http://localhost:${port}`;

  const qs = new URLSearchParams({ secret });
  if (opts?.admin) qs.set("admin", "1");
  if (opts?.email) qs.set("email", opts.email);
  if (opts?.password) qs.set("password", opts.password);
  if (opts?.redirect) qs.set("redirect", opts.redirect);

  await page.goto(`${origin}${basePath}/api/e2e/session?${qs.toString()}`, {
    waitUntil: "domcontentloaded",
  });

  const authCookie = (await page.context().cookies()).find((c) =>
    c.name.includes("-auth-token"),
  );
  expect(authCookie, "expected auth cookie after /api/e2e/session").toBeTruthy();

  await injectCookieViaCdp(page, `${authCookie!.name}=${authCookie!.value}`);

  const dest = opts?.admin ? "en/admin" : "en/dashboard";
  await page.goto(`${origin}${basePath}/${dest}`, { waitUntil: "domcontentloaded" });
  if (opts?.admin) {
    await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
  } else {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  }
}

async function injectCookieViaCdp(page: Page, cookieHeader: string) {
  const client = await page.context().newCDPSession(page);
  await client.send("Fetch.enable", {
    patterns: [{ urlPattern: "*localhost*", requestStage: "Request" }],
  });

  client.on("Fetch.requestPaused", async (event: {
    requestId: string;
    request: { headers: Record<string, string> };
  }) => {
    try {
      const headers = Object.entries(event.request.headers)
        .filter(([k]) => k.toLowerCase() !== "cookie")
        .map(([name, value]) => ({ name, value }));
      headers.push({ name: "Cookie", value: cookieHeader });
      await client.send("Fetch.continueRequest", {
        requestId: event.requestId,
        headers,
      });
    } catch {
      try {
        await client.send("Fetch.continueRequest", { requestId: event.requestId });
      } catch {
        // request may already have been continued/failed
      }
    }
  });
}
