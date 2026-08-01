"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  propagateIngredientChange,
  recomputeWorkspace,
  type PropagationSummary,
} from "@/lib/costing/service";
import { getCurrentUserWorkspace, isWorkspaceReadOnly } from "@/lib/workspace";
import { routing } from "@/i18n/routing";
import type { AppLocale, IngredientRow } from "@/lib/supabase/database.types";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  supplier: z.string().trim().max(120).optional().or(z.literal("")),
  baseUnit: z.enum(["g", "ml", "unit"]),
  purchaseQty: z.coerce.number().positive(),
  purchaseUnit: z.string().trim().min(1).max(10),
  purchasePrice: z.coerce.number().min(0),
  density: z.coerce.number().positive().optional(),
  yieldPct: z.coerce.number().min(0.01).max(100),
  allergens: z.string().optional().or(z.literal("")),
});

function resolveLocale(value: FormDataEntryValue | null): AppLocale {
  const v = typeof value === "string" ? value : "";
  return routing.locales.includes(v as (typeof routing.locales)[number])
    ? (v as AppLocale)
    : (routing.defaultLocale as AppLocale);
}

function parseForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    supplier: formData.get("supplier"),
    baseUnit: formData.get("baseUnit"),
    purchaseQty: formData.get("purchaseQty"),
    purchaseUnit: formData.get("purchaseUnit"),
    purchasePrice: formData.get("purchasePrice"),
    density: formData.get("density") === "" ? undefined : formData.get("density"),
    yieldPct: formData.get("yieldPct"),
    allergens: formData.get("allergens"),
  };
  return schema.parse(raw);
}

function allergenList(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

export async function createIngredient(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const data = parseForm(formData);
  const priceCents = Math.round(data.purchasePrice * 100);
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("ingredients")
    .insert({
      workspace_id: session.workspace.id,
      name: data.name,
      supplier_name: data.supplier || null,
      purchase_qty: data.purchaseQty,
      purchase_unit: data.purchaseUnit,
      purchase_price_cents: priceCents,
      base_unit: data.baseUnit,
      density_or_unit_weight: data.density ?? null,
      yield_pct: data.yieldPct,
      allergens: allergenList(data.allergens || undefined),
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Insert failed");

  await supabase.from("ingredient_price_history").insert({
    ingredient_id: created.id,
    price_cents: priceCents,
    source: "manual",
  });

  await recomputeWorkspace(session.workspace.id);
  revalidatePath(`/${locale}/ingredients`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function updateIngredient(
  formData: FormData,
): Promise<PropagationSummary | null> {
  const locale = resolveLocale(formData.get("locale"));
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing id");

  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const data = parseForm(formData);
  const priceCents = Math.round(data.purchasePrice * 100);
  const supabase = await createClient();

  const { data: prev } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", session.workspace.id)
    .single();

  if (!prev) throw new Error("Ingredient not found");
  const before = prev as IngredientRow;
  const priceChanged = before.purchase_price_cents !== priceCents;

  const { error } = await supabase
    .from("ingredients")
    .update({
      name: data.name,
      supplier_name: data.supplier || null,
      purchase_qty: data.purchaseQty,
      purchase_unit: data.purchaseUnit,
      purchase_price_cents: priceCents,
      base_unit: data.baseUnit,
      density_or_unit_weight: data.density ?? null,
      yield_pct: data.yieldPct,
      allergens: allergenList(data.allergens || undefined),
    })
    .eq("id", id)
    .eq("workspace_id", session.workspace.id);

  if (error) throw new Error(error.message);

  let summary: PropagationSummary | null = null;

  if (priceChanged) {
    await supabase.from("ingredient_price_history").insert({
      ingredient_id: id,
      price_cents: priceCents,
      source: "manual",
    });
    summary = await propagateIngredientChange(session.workspace.id, id, before);
  } else {
    await recomputeWorkspace(session.workspace.id);
  }

  revalidatePath(`/${locale}/ingredients`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/recipes`);
  revalidatePath(`/${locale}/profitability`);
  return summary;
}

export async function archiveIngredient(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing id");

  const session = await getCurrentUserWorkspace(locale);
  if (!session) throw new Error("Unauthorized");
  if (isWorkspaceReadOnly(session)) throw new Error("Workspace is read-only");

  const supabase = await createClient();
  const { error } = await supabase
    .from("ingredients")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", session.workspace.id);

  if (error) throw new Error(error.message);

  await recomputeWorkspace(session.workspace.id);
  revalidatePath(`/${locale}/ingredients`);
  revalidatePath(`/${locale}/dashboard`);
}
