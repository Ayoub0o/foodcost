"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const emailSchema = z.string().trim().email();

function siteOrigin(hdrs: Headers): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function basePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
}

function resolveLocale(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? v
    : routing.defaultLocale;
}

/** Email + password sign-in (local/dev and accounts that have a password). */
export async function signInWithPassword(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const next = (formData.get("next") as string) || `/${locale}/dashboard`;

  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(6).safeParse(formData.get("password"));
  if (!email.success || !password.success) {
    redirect(`/${locale}/login?error=credentials`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });
  if (error) {
    redirect(`/${locale}/login?error=credentials`);
  }
  redirect(next.startsWith("/") ? next : `/${locale}/dashboard`);
}

/** Send a passwordless magic link (also serves as email verification). */
export async function signInWithMagicLink(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const next = (formData.get("next") as string) || `/${locale}/dashboard`;

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    redirect(`/${locale}/login?error=email`);
  }
  const email = parsed.data;

  const supabase = await createClient();
  const hdrs = await headers();
  const callback = `${siteOrigin(hdrs)}${basePath()}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback },
  });

  if (error) {
    redirect(`/${locale}/login?error=send`);
  }
  redirect(`/${locale}/login?sent=${encodeURIComponent(email)}`);
}

/** Start the Google OAuth flow. */
export async function signInWithGoogle(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const next = (formData.get("next") as string) || `/${locale}/dashboard`;

  const supabase = await createClient();
  const hdrs = await headers();
  const callback = `${siteOrigin(hdrs)}${basePath()}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback },
  });

  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth`);
  }
  redirect(data.url);
}

/** Sign the current user out and return to the localized home page. */
export async function signOut(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
