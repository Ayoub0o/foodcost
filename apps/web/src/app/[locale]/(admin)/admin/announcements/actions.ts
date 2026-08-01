"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, writeAuditLog } from "@/lib/admin";
import { routing } from "@/i18n/routing";
import type { AnnouncementLevel, AppLocale } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

export async function upsertAnnouncement(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const admin = await requirePlatformAdmin();
  if (!admin) throw new Error("Forbidden");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const level = String(formData.get("level") ?? "info");
  const active = formData.get("active") === "on";
  const annLocale = String(formData.get("annLocale") ?? "") || null;

  if (!title || !body) throw new Error("Invalid");

  const db = createServiceRoleClient();
  const payload: {
    title: string;
    body: string;
    level: AnnouncementLevel;
    active: boolean;
    locale: AppLocale | null;
  } = {
    title,
    body,
    level: level === "warning" ? "warning" : "info",
    active,
    locale: annLocale === "en" || annLocale === "fr" ? annLocale : null,
  };

  if (id) {
    await db.from("announcements").update(payload).eq("id", id);
  } else {
    await db.from("announcements").insert(payload);
  }

  await writeAuditLog({
    actorUserId: admin.userId,
    action: id ? "announcement_update" : "announcement_create",
    targetType: "announcement",
    targetId: id || undefined,
    meta: { title },
  });

  revalidatePath(`/${locale}/admin/announcements`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function deleteAnnouncement(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const id = String(formData.get("id") ?? "");
  const admin = await requirePlatformAdmin();
  if (!admin || !id) throw new Error("Forbidden");

  const db = createServiceRoleClient();
  await db.from("announcements").delete().eq("id", id);

  await writeAuditLog({
    actorUserId: admin.userId,
    action: "announcement_delete",
    targetType: "announcement",
    targetId: id,
  });

  revalidatePath(`/${locale}/admin/announcements`);
}
