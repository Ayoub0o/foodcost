import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import { formatMoneyCents, formatPct, STATUS_TONE } from "@/lib/format";
import type {
  AppLocale,
  RecipeCostCacheRow,
  RecipeCostStatus,
  RecipeRow,
} from "@/lib/supabase/database.types";

type DishRow = {
  id: string;
  name: string;
  category: string | null;
  menu_price_cents: number | null;
  cache: RecipeCostCacheRow | null;
};

export default async function ProfitabilityPage({
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
    .select("id,name,category,menu_price_cents,type")
    .eq("workspace_id", workspace.id)
    .eq("type", "dish")
    .is("archived_at", null)
    .order("name");

  const recipes = (recData ?? []) as Pick<
    RecipeRow,
    "id" | "name" | "category" | "menu_price_cents" | "type"
  >[];

  const ids = recipes.map((r) => r.id);
  const cacheById = new Map<string, RecipeCostCacheRow>();
  if (ids.length > 0) {
    const { data: cacheData } = await supabase
      .from("recipe_cost_cache")
      .select("*")
      .in("recipe_id", ids);
    for (const c of (cacheData ?? []) as RecipeCostCacheRow[]) {
      cacheById.set(c.recipe_id, c);
    }
  }

  const dishes: DishRow[] = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    menu_price_cents: r.menu_price_cents,
    cache: cacheById.get(r.id) ?? null,
  }));

  const ranked = [...dishes].sort((a, b) => {
    const ap = a.cache?.food_cost_pct;
    const bp = b.cache?.food_cost_pct;
    if (ap == null && bp == null) return a.name.localeCompare(b.name);
    if (ap == null) return 1;
    if (bp == null) return -1;
    return Number(ap) - Number(bp);
  });

  const withPct = ranked.filter((d) => d.cache?.food_cost_pct != null);
  const top5 = withPct.slice(0, 5);
  const bottom5 = [...withPct].reverse().slice(0, 5);

  const t = await getTranslations("App.profitability");
  const ts = await getTranslations("App.status");

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-6 flex flex-wrap gap-3 text-xs" data-testid="status-legend">
        {(["green", "orange", "red", "no_price"] as RecipeCostStatus[]).map((s) => (
          <span
            key={s}
            className={`rounded-xs border px-2 py-1 ${STATUS_TONE[s]}`}
          >
            {ts(s)}
          </span>
        ))}
      </div>

      {dishes.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-semibold text-heading">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text">{t("emptyBody")}</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Widget title={t("top5")} rows={top5} locale={locale} t={t} ts={ts} />
            <Widget title={t("bottom5")} rows={bottom5} locale={locale} t={t} ts={ts} />
          </div>

          <div className="mt-8 overflow-x-auto rounded-lg border border-border" data-testid="profitability-table">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-container text-heading">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("colName")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colCategory")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colCost")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colPrice")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colFc")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colMargin")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((d) => {
                  const status = d.cache?.status ?? "no_price";
                  const marginPct =
                    d.menu_price_cents && d.cache?.margin_cents != null
                      ? (Number(d.cache.margin_cents) / d.menu_price_cents) * 100
                      : null;
                  return (
                    <tr key={d.id} className="border-t border-border-mute">
                      <td className="px-4 py-3 font-medium text-heading">{d.name}</td>
                      <td className="px-4 py-3 text-text">{d.category ?? "—"}</td>
                      <td className="px-4 py-3 text-heading">
                        {formatMoneyCents(d.cache?.cost_per_portion_cents, workspace.currency, locale)}
                      </td>
                      <td className="px-4 py-3 text-heading">
                        {formatMoneyCents(d.menu_price_cents, workspace.currency, locale)}
                      </td>
                      <td className="px-4 py-3 text-heading" data-testid="profit-fc">
                        {formatPct(
                          d.cache?.food_cost_pct == null ? null : Number(d.cache.food_cost_pct),
                          locale,
                        )}
                      </td>
                      <td className="px-4 py-3 text-text">
                        {formatMoneyCents(d.cache?.margin_cents, workspace.currency, locale)}
                        {marginPct != null && (
                          <span className="ml-1 text-xs">({formatPct(marginPct, locale)})</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-xs border px-2 py-0.5 text-xs ${STATUS_TONE[status]}`}>
                          {ts(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <FcDistribution dishes={withPct} target={Number(workspace.target_food_cost_pct)} t={t} />
        </>
      )}
    </div>
  );
}

function Widget({
  title,
  rows,
  locale,
  t,
  ts,
}: {
  title: string;
  rows: DishRow[];
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
  ts: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div className="rounded-lg border border-border bg-container p-6">
      <h2 className="text-lg font-semibold text-heading">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-text">{t("noRanked")}</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rows.map((d, i) => (
            <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-heading">
                <span className="mr-2 text-text">{i + 1}.</span>
                {d.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-heading">
                  {formatPct(
                    d.cache?.food_cost_pct == null ? null : Number(d.cache.food_cost_pct),
                    locale,
                  )}
                </span>
                <span
                  className={`rounded-xs border px-1.5 py-0.5 text-[10px] ${STATUS_TONE[d.cache?.status ?? "no_price"]}`}
                >
                  {ts(d.cache?.status ?? "no_price")}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FcDistribution({
  dishes,
  target,
  t,
}: {
  dishes: DishRow[];
  target: number;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  if (dishes.length === 0) return null;
  const buckets = [
    { label: `≤ ${target - 5}%`, count: 0 },
    { label: `${target - 5}–${target}%`, count: 0 },
    { label: `${target}–${target + 5}%`, count: 0 },
    { label: `> ${target + 5}%`, count: 0 },
  ];
  for (const d of dishes) {
    const pct = Number(d.cache!.food_cost_pct);
    if (pct <= target - 5) buckets[0]!.count++;
    else if (pct <= target) buckets[1]!.count++;
    else if (pct <= target + 5) buckets[2]!.count++;
    else buckets[3]!.count++;
  }
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="mt-8 rounded-lg border border-border bg-container p-6" data-testid="fc-distribution">
      <h2 className="text-lg font-semibold text-heading">{t("distribution")}</h2>
      <div className="mt-6 flex items-end gap-4">
        {buckets.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xs bg-accent/40"
              style={{ height: `${Math.max(8, (b.count / max) * 96)}px` }}
              title={String(b.count)}
            />
            <p className="text-center text-[10px] text-text">{b.label}</p>
            <p className="text-xs font-medium text-heading">{b.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
