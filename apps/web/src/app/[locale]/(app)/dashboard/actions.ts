"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

export async function acknowledgeAlert(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing id");

  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("alerts")
    .update({ acknowledged_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", session.workspace.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/${locale}/dashboard`);
}
