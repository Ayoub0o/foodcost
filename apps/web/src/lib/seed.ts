import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { recomputeWorkspace } from "@/lib/costing/service";
import type { AppLocale } from "@/lib/supabase/database.types";

interface SeedIngredient {
  key: string;
  name: { en: string; fr: string };
  supplier: string;
  purchaseQty: number;
  purchaseUnit: string;
  purchasePriceCents: number;
  baseUnit: "g" | "ml" | "unit";
  densityOrUnitWeight?: number | null;
  yieldPct?: number;
  allergens?: string[];
}

interface SeedRecipeItem {
  ingredient: string;
  qty: number;
  unit: string;
}

interface SeedRecipe {
  name: { en: string; fr: string };
  category: { en: string; fr: string };
  portions: number;
  menuPriceCents: number;
  items: SeedRecipeItem[];
}

const SEED_INGREDIENTS: SeedIngredient[] = [
  { key: "beef", name: { en: "Ground beef 80/20", fr: "Bœuf haché 80/20" }, supplier: "Sample Supplier", purchaseQty: 1000, purchaseUnit: "g", purchasePriceCents: 850, baseUnit: "g" },
  { key: "bun", name: { en: "Burger bun", fr: "Pain à burger" }, supplier: "Sample Supplier", purchaseQty: 12, purchaseUnit: "unit", purchasePriceCents: 600, baseUnit: "unit", allergens: ["gluten"] },
  { key: "cheddar", name: { en: "Cheddar slice", fr: "Tranche de cheddar" }, supplier: "Sample Supplier", purchaseQty: 500, purchaseUnit: "g", purchasePriceCents: 720, baseUnit: "g", allergens: ["milk"] },
  { key: "lettuce", name: { en: "Lettuce", fr: "Laitue" }, supplier: "Sample Supplier", purchaseQty: 1, purchaseUnit: "unit", purchasePriceCents: 180, baseUnit: "unit", yieldPct: 80 },
  { key: "tomato", name: { en: "Tomato", fr: "Tomate" }, supplier: "Sample Supplier", purchaseQty: 1000, purchaseUnit: "g", purchasePriceCents: 350, baseUnit: "g", yieldPct: 90 },
  { key: "potato", name: { en: "Potato", fr: "Pomme de terre" }, supplier: "Sample Supplier", purchaseQty: 5000, purchaseUnit: "g", purchasePriceCents: 600, baseUnit: "g", yieldPct: 85 },
  { key: "oil", name: { en: "Frying oil", fr: "Huile de friture" }, supplier: "Sample Supplier", purchaseQty: 1000, purchaseUnit: "ml", purchasePriceCents: 300, baseUnit: "ml" },
  { key: "romaine", name: { en: "Romaine heart", fr: "Cœur de romaine" }, supplier: "Sample Supplier", purchaseQty: 1, purchaseUnit: "unit", purchasePriceCents: 220, baseUnit: "unit", yieldPct: 85 },
  { key: "dressing", name: { en: "Caesar dressing", fr: "Sauce César" }, supplier: "Sample Supplier", purchaseQty: 500, purchaseUnit: "ml", purchasePriceCents: 500, baseUnit: "ml", allergens: ["egg", "fish"] },
  { key: "parmesan", name: { en: "Parmesan", fr: "Parmesan" }, supplier: "Sample Supplier", purchaseQty: 200, purchaseUnit: "g", purchasePriceCents: 600, baseUnit: "g", allergens: ["milk"] },
  { key: "lemon", name: { en: "Lemon", fr: "Citron" }, supplier: "Sample Supplier", purchaseQty: 1, purchaseUnit: "unit", purchasePriceCents: 80, baseUnit: "unit" },
  { key: "sugar", name: { en: "Sugar", fr: "Sucre" }, supplier: "Sample Supplier", purchaseQty: 1000, purchaseUnit: "g", purchasePriceCents: 200, baseUnit: "g" },
];

const SEED_RECIPES: SeedRecipe[] = [
  {
    name: { en: "Maison Burger", fr: "Burger Maison" },
    category: { en: "Mains", fr: "Plats" },
    portions: 1,
    menuPriceCents: 990,
    items: [
      { ingredient: "beef", qty: 150, unit: "g" },
      { ingredient: "bun", qty: 1, unit: "unit" },
      { ingredient: "cheddar", qty: 20, unit: "g" },
      { ingredient: "lettuce", qty: 0.1, unit: "unit" },
      { ingredient: "tomato", qty: 30, unit: "g" },
    ],
  },
  {
    name: { en: "House Fries", fr: "Frites Maison" },
    category: { en: "Sides", fr: "Accompagnements" },
    portions: 1,
    menuPriceCents: 450,
    items: [
      { ingredient: "potato", qty: 200, unit: "g" },
      { ingredient: "oil", qty: 15, unit: "ml" },
    ],
  },
  {
    name: { en: "Caesar Salad", fr: "Salade César" },
    category: { en: "Starters", fr: "Entrées" },
    portions: 1,
    menuPriceCents: 800,
    items: [
      { ingredient: "romaine", qty: 1, unit: "unit" },
      { ingredient: "dressing", qty: 30, unit: "ml" },
      { ingredient: "parmesan", qty: 15, unit: "g" },
    ],
  },
  {
    name: { en: "House Lemonade", fr: "Limonade Maison" },
    category: { en: "Drinks", fr: "Boissons" },
    portions: 1,
    menuPriceCents: 350,
    items: [
      { ingredient: "lemon", qty: 1, unit: "unit" },
      { ingredient: "sugar", qty: 20, unit: "g" },
    ],
  },
];

/**
 * Seed a freshly created workspace with a fully costed demo menu badged
 * "Example — delete anytime" (DIRECTIVE §5.2), so no screen is ever empty.
 */
export async function seedSampleWorkspace(workspaceId: string, locale: AppLocale): Promise<void> {
  const supabase = await createClient();

  const idByKey = new Map<string, string>();
  const ingredientRows = SEED_INGREDIENTS.map((ing) => {
    const id = randomUUID();
    idByKey.set(ing.key, id);
    return {
      id,
      workspace_id: workspaceId,
      name: ing.name[locale],
      supplier_name: ing.supplier,
      purchase_qty: ing.purchaseQty,
      purchase_unit: ing.purchaseUnit,
      purchase_price_cents: ing.purchasePriceCents,
      base_unit: ing.baseUnit,
      density_or_unit_weight: ing.densityOrUnitWeight ?? null,
      yield_pct: ing.yieldPct ?? 100,
      allergens: ing.allergens ?? [],
      is_sample: true,
    };
  });

  const { error: ingError } = await supabase.from("ingredients").insert(ingredientRows);
  if (ingError) return;

  await supabase.from("ingredient_price_history").insert(
    ingredientRows.map((r) => ({
      ingredient_id: r.id,
      price_cents: r.purchase_price_cents,
      source: "manual" as const,
    })),
  );

  const itemRows: {
    recipe_id: string;
    ingredient_id: string;
    qty: number;
    unit: string;
    position: number;
  }[] = [];

  for (const rec of SEED_RECIPES) {
    const recipeId = randomUUID();
    const { error: recError } = await supabase.from("recipes").insert({
      id: recipeId,
      workspace_id: workspaceId,
      name: rec.name[locale],
      category: rec.category[locale],
      type: "dish",
      portions: rec.portions,
      menu_price_cents: rec.menuPriceCents,
      is_sample: true,
    });
    if (recError) continue;

    rec.items.forEach((item, index) => {
      const ingredientId = idByKey.get(item.ingredient);
      if (!ingredientId) return;
      itemRows.push({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        qty: item.qty,
        unit: item.unit,
        position: index,
      });
    });
  }

  if (itemRows.length > 0) {
    await supabase.from("recipe_items").insert(itemRows);
  }

  await recomputeWorkspace(workspaceId);
}
