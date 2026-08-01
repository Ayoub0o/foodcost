import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import { formatPct, STATUS_TONE } from "@/lib/format";
import { createRecipe } from "./actions";
import type {
  AppLocale,
  RecipeCostCacheRow,
  RecipeRow,
} from "@/lib/supabase/database.types";

export default async function RecipesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);
  const { workspace } = session;

  const supabase = await createClient();
  const { data: recData } = await supabase
    .from("recipes")
    .select("*")
    .eq("workspace_id", workspace.id)
    .is("archived_at", null)
    .order("name", { ascending: true });

  const recipes = (recData ?? []) as RecipeRow[];
  const recipeIds = recipes.map((r) => r.id);
  const cacheById = new Map<string, RecipeCostCacheRow>();
  if (recipeIds.length > 0) {
    const { data: cacheData } = await supabase
      .from("recipe_cost_cache")
      .select("*")
      .in("recipe_id", recipeIds);
    for (const c of (cacheData ?? []) as RecipeCostCacheRow[]) cacheById.set(c.recipe_id, c);
  }

  const t = await getTranslations("App.recipes");
  const tc = await getTranslations("App.common");
  const ts = await getTranslations("App.status");

  const newButton = (
    <form action={createRecipe}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" data-testid="recipe-new" className="btn-accent !px-4 !py-2 text-sm">
        {t("new")}
      </button>
    </form>
  );

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} action={newButton} />

      {recipes.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-semibold text-heading">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text">{t("emptyBody")}</p>
          <div className="mt-6 inline-block">{newButton}</div>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-container text-heading">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("colName")}</th>
                <th className="px-4 py-3 font-semibold">{t("colCategory")}</th>
                <th className="px-4 py-3 font-semibold">{t("colFc")}</th>
                <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => {
                const cache = cacheById.get(r.id);
                const status = cache?.status ?? "no_price";
                return (
                  <tr key={r.id} className="border-t border-border-mute hover:bg-container/50">
                    <td className="px-4 py-3">
                      <Link
                        href={{ pathname: "/recipes/[id]", params: { id: r.id } }}
                        className="font-medium text-heading hover:text-accent-text"
                      >
                        {r.name}
                      </Link>
                      {r.is_sample && (
                        <span className="ml-2 rounded-xs border border-border px-1.5 py-0.5 text-[10px] text-text">
                          {tc("example")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text">{r.category ?? "—"}</td>
                    <td className="px-4 py-3 text-heading">
                      {cache?.food_cost_pct != null ? formatPct(Number(cache.food_cost_pct), locale) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-xs border px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}>
                        {ts(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
