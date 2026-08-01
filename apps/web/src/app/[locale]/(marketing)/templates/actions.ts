"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const emailSchema = z.string().trim().email();

const SLUGS: Record<string, string> = {
  en: "/templates",
  fr: "/modeles",
};

function resolveLocale(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? v
    : routing.defaultLocale;
}

/** Capture a marketing lead, then unlock the template downloads. */
export async function captureLead(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const base = SLUGS[locale] ?? SLUGS.en!;

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    redirect(`/${locale}${base}?error=email`);
  }
  const email = parsed.data;

  // Persist the lead. A logging failure must never block the download, so we
  // swallow errors here (e.g. service-role key not configured in local dev).
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServiceRoleClient();
      await supabase.from("marketing_leads").insert({
        email,
        source: "templates",
        locale: locale as "en" | "fr",
      });
    }
  } catch {
    // Intentionally ignored: capture is best-effort for the lead-magnet.
  }

  redirect(`/${locale}${base}?unlocked=1`);
}
