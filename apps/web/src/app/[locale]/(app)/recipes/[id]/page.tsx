import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { RecipeEditor, type RecipeEditorData } from "@/components/app/RecipeEditor";
import type { IngredientDTO } from "@/components/app/IngredientsClient";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import type {
  AppLocale,
  IngredientRow,
  RecipeItemRow,
  RecipeRow,
} from "@/lib/supabase/database.types";

export default async function RecipeEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);
  const { workspace } = session;

  const supabase = await createClient();
  const { data: recipeData } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .is("archived_at", null)
    .single();

  if (!recipeData) notFound();
  const recipe = recipeData as RecipeRow;

  const [{ data: itemData }, { data: ingData }] = await Promise.all([
    supabase.from("recipe_items").select("*").eq("recipe_id", id).order("position", { ascending: true }),
    supabase
      .from("ingredients")
      .select("*")
      .eq("workspace_id", workspace.id)
      .is("archived_at", null)
      .order("name", { ascending: true }),
  ]);

  const ingredients: IngredientDTO[] = ((ingData ?? []) as IngredientRow[]).map((i) => ({
    id: i.id,
    name: i.name,
    supplier_name: i.supplier_name,
    purchase_qty: Number(i.purchase_qty),
    purchase_unit: i.purchase_unit,
    purchase_price_cents: i.purchase_price_cents,
    base_unit: i.base_unit,
    density_or_unit_weight: i.density_or_unit_weight == null ? null : Number(i.density_or_unit_weight),
    yield_pct: Number(i.yield_pct),
    allergens: i.allergens ?? [],
    is_sample: i.is_sample,
  }));

  const initialItems = ((itemData ?? []) as RecipeItemRow[])
    .filter((it) => it.ingredient_id)
    .map((it) => ({
      ingredientId: it.ingredient_id as string,
      qty: String(Number(it.qty)),
      unit: it.unit,
    }));

  const editorRecipe: RecipeEditorData = {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    type: recipe.type,
    portions: Number(recipe.portions),
    menu_price_cents: recipe.menu_price_cents,
    is_sample: recipe.is_sample,
  };

  const t = await getTranslations("App.recipes");
  const tc = await getTranslations("App.common");

  return (
    <div className="container-bringer py-10">
      <Link href="/recipes" className="text-sm text-text hover:text-heading">
        ← {tc("back")}
      </Link>
      <div className="mt-4">
        <PageHeader title={recipe.name} subtitle={t("subtitle")} />
      </div>
      <RecipeEditor
        recipe={editorRecipe}
        initialItems={initialItems}
        ingredients={ingredients}
        targetFoodCostPct={Number(workspace.target_food_cost_pct)}
        locale={locale}
        currency={workspace.currency}
      />
    </div>
  );
}
