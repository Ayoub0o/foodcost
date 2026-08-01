import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import { formatMoneyCents, formatPct } from "@/lib/format";
import { acknowledgeAlert } from "./actions";
import type {
  AlertRow,
  AppLocale,
  RecipeCostCacheRow,
  RecipeRow,
} from "@/lib/supabase/database.types";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Deduped with (app)/layout via React.cache
  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);
  const { workspace } = session;

  const supabase = await createClient();
  const [{ data: ingData }, { data: recData }, { data: alertData }] = await Promise.all([
    supabase
      .from("ingredients")
      .select("id,name")
      .eq("workspace_id", workspace.id)
      .is("archived_at", null),
    supabase
      .from("recipes")
      .select("id,name,menu_price_cents")
      .eq("workspace_id", workspace.id)
      .is("archived_at", null),
    supabase
      .from("alerts")
      .select("id,recipe_id,type,old_pct,new_pct,triggered_by_ingredient_id,created_at")
      .eq("workspace_id", workspace.id)
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const ingredients = (ingData ?? []) as { id: string; name: string }[];
  const ingredientsCount = ingredients.length;
  const recipes = (recData ?? []) as Pick<RecipeRow, "id" | "name" | "menu_price_cents">[];
  const recipesCount = recipes.length;
  const recipeNameById = Object.fromEntries(recipes.map((r) => [r.id, r.name]));
  const ingredientNameById = Object.fromEntries(ingredients.map((i) => [i.id, i.name]));
  const alerts = (alertData ?? []) as AlertRow[];

  const recipeIds = recipes.map((r) => r.id);
  const ingredientIds = ingredients.map((i) => i.id);

  type HistoryRow = {
    id: string;
    ingredient_id: string;
    price_cents: number;
    recorded_at: string;
  };

  const [{ data: cacheData }, { data: histData }] = await Promise.all([
    recipeIds.length > 0
      ? supabase
          .from("recipe_cost_cache")
          .select("recipe_id,food_cost_pct,margin_cents,status")
          .in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] as RecipeCostCacheRow[] }),
    ingredientIds.length > 0
      ? supabase
          .from("ingredient_price_history")
          .select("id,ingredient_id,price_cents,recorded_at")
          .in("ingredient_id", ingredientIds)
          .order("recorded_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as HistoryRow[] }),
  ]);

  const cache = (cacheData ?? []) as RecipeCostCacheRow[];
  const history = (histData ?? []) as HistoryRow[];

  const priced = cache.filter((c) => c.food_cost_pct != null);
  const avgFc =
    priced.length > 0
      ? priced.reduce((s, c) => s + Number(c.food_cost_pct), 0) / priced.length
      : null;
  const withMargin = cache.filter((c) => c.margin_cents != null);
  const avgMargin =
    withMargin.length > 0
      ? Math.round(withMargin.reduce((s, c) => s + Number(c.margin_cents), 0) / withMargin.length)
      : null;
  const overThreshold = cache.filter((c) => c.status === "red").length;

  const t = await getTranslations("App.overview");

  const hasPrice = recipes.some((r) => r.menu_price_cents != null);
  const checklist = [
    { label: t("checklistAddIngredients"), done: ingredientsCount >= 5 },
    { label: t("checklistCreateRecipes"), done: recipesCount >= 3 },
    { label: t("checklistSetPrice"), done: hasPrice },
  ];
  const allDone = checklist.every((c) => c.done);

  const kpis = [
    { label: t("avgFc"), value: formatPct(avgFc, locale) },
    { label: t("margin"), value: formatMoneyCents(avgMargin, workspace.currency, locale) },
    { label: t("overThreshold"), value: String(overThreshold) },
    { label: t("ingredients"), value: String(ingredientsCount) },
  ];

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-container p-6">
            <p className="text-xs text-text">{k.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-heading">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-container p-6">
          <h2 className="text-lg font-semibold text-heading">{t("checklistTitle")}</h2>
          {allDone ? (
            <p className="mt-4 text-sm text-emerald-400">{t("checklistDone")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                      c.done
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "border-border text-text"
                    }`}
                  >
                    {c.done ? "✓" : ""}
                  </span>
                  <span className={c.done ? "text-text line-through" : "text-heading"}>{c.label}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex gap-3">
            <Link href="/ingredients" className="btn-ghost !px-4 !py-2 text-sm">
              {t("ingredients")}
            </Link>
            <Link href="/recipes" className="btn-accent !px-4 !py-2 text-sm">
              {t("recipes")}
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-container p-6" data-testid="alerts-panel">
          <h2 className="text-lg font-semibold text-heading">{t("alerts")}</h2>
          {alerts.length === 0 ? (
            <p className="mt-4 text-sm text-text">{t("noAlerts")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  data-testid="alert-row"
                  className="flex items-start justify-between gap-3 rounded-xs border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-heading">
                      {recipeNameById[a.recipe_id] ?? t("unknownRecipe")}
                    </p>
                    <p className="mt-0.5 text-xs text-text">
                      {formatPct(a.old_pct == null ? null : Number(a.old_pct), locale)} →{" "}
                      {formatPct(a.new_pct == null ? null : Number(a.new_pct), locale)}
                      {a.triggered_by_ingredient_id &&
                        ingredientNameById[a.triggered_by_ingredient_id] &&
                        ` · ${ingredientNameById[a.triggered_by_ingredient_id]}`}
                    </p>
                  </div>
                  <form action={acknowledgeAlert}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-xs text-accent-text hover:underline">
                      {t("acknowledge")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-container p-6" data-testid="what-changed">
        <h2 className="text-lg font-semibold text-heading">{t("whatChanged")}</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-text">{t("noChanges")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-mute">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-heading">
                    {ingredientNameById[h.ingredient_id] ?? t("unknownIngredient")}
                  </p>
                  <p className="text-xs text-text">
                    {new Date(h.recorded_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
                  </p>
                </div>
                <p className="text-heading">
                  {formatMoneyCents(h.price_cents, workspace.currency, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
