"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recomputeWorkspace } from "@/lib/costing/service";
import { getCurrentUserWorkspace, isWorkspaceReadOnly } from "@/lib/workspace";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/supabase/database.types";

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

const itemSchema = z.object({
  ingredientId: z.string().uuid(),
  qty: z.coerce.number().positive(),
  unit: z.string().min(1).max(10),
});

const saveSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.enum(["dish", "sub_recipe"]),
  portions: z.coerce.number().positive(),
  menuPrice: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  items: z.array(itemSchema),
});

export async function createRecipe(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const supabase = await createClient();
  const defaultName = locale === "fr" ? "Nouvelle recette" : "New recipe";
  const { data: created, error } = await supabase
    .from("recipes")
    .insert({
      workspace_id: session.workspace.id,
      name: defaultName,
      type: "dish",
      portions: 1,
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Insert failed");

  revalidatePath(`/${locale}/recipes`);
  redirect(`/${locale}/recipes/${created.id}`);
}

export async function saveRecipe(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing id");

  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const itemsRaw = formData.get("items");
  const parsed = saveSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    type: formData.get("type"),
    portions: formData.get("portions"),
    menuPrice: formData.get("menuPrice") === "" ? undefined : formData.get("menuPrice"),
    items: typeof itemsRaw === "string" && itemsRaw ? JSON.parse(itemsRaw) : [],
  });

  const menuPriceCents =
    parsed.menuPrice === "" || parsed.menuPrice == null
      ? null
      : Math.round(Number(parsed.menuPrice) * 100);

  const supabase = await createClient();

  const { error: recError } = await supabase
    .from("recipes")
    .update({
      name: parsed.name,
      category: parsed.category || null,
      type: parsed.type,
      portions: parsed.portions,
      menu_price_cents: menuPriceCents,
    })
    .eq("id", id)
    .eq("workspace_id", session.workspace.id);

  if (recError) throw new Error(recError.message);

  // Replace items wholesale (simplest correct approach for small recipes).
  await supabase.from("recipe_items").delete().eq("recipe_id", id);
  if (parsed.items.length > 0) {
    await supabase.from("recipe_items").insert(
      parsed.items.map((it, index) => ({
        recipe_id: id,
        ingredient_id: it.ingredientId,
        qty: it.qty,
        unit: it.unit,
        position: index,
      })),
    );
  }

  await recomputeWorkspace(session.workspace.id);
  revalidatePath(`/${locale}/recipes`);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/recipes`);
}

export async function archiveRecipe(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing id");

  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", session.workspace.id);

  if (error) throw new Error(error.message);

  await recomputeWorkspace(session.workspace.id);
  revalidatePath(`/${locale}/recipes`);
  redirect(`/${locale}/recipes`);
}
