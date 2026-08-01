"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  costRecipe,
  suggestedPrice,
  type CostGraph,
  type Unit,
} from "@foodcost/costing-engine";
import { unitLabel, unitsForBase } from "@/lib/costing/units";
import { formatMoneyCents, formatPct, STATUS_TONE } from "@/lib/format";
import type { IngredientDTO } from "@/components/app/IngredientsClient";
import { saveRecipe, archiveRecipe } from "@/app/[locale]/(app)/recipes/actions";

export interface RecipeEditorData {
  id: string;
  name: string;
  category: string | null;
  type: "dish" | "sub_recipe";
  portions: number;
  menu_price_cents: number | null;
  is_sample: boolean;
}

interface ItemState {
  ingredientId: string;
  qty: string;
  unit: string;
}

export function RecipeEditor({
  recipe,
  initialItems,
  ingredients,
  targetFoodCostPct,
  locale,
  currency,
}: {
  recipe: RecipeEditorData;
  initialItems: ItemState[];
  ingredients: IngredientDTO[];
  targetFoodCostPct: number;
  locale: string;
  currency: string;
}) {
  const t = useTranslations("App.recipes");
  const tc = useTranslations("App.common");
  const ts = useTranslations("App.status");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(recipe.name);
  const [category, setCategory] = useState(recipe.category ?? "");
  const [portions, setPortions] = useState(String(recipe.portions));
  const [menuPrice, setMenuPrice] = useState(
    recipe.menu_price_cents == null ? "" : String(recipe.menu_price_cents / 100),
  );
  const [items, setItems] = useState<ItemState[]>(initialItems);

  const ingredientById = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const cost = useMemo(() => {
    const graph: CostGraph = { ingredients: {}, recipes: {} };
    for (const i of ingredients) {
      graph.ingredients[i.id] = {
        id: i.id,
        purchaseQty: i.purchase_qty,
        purchaseUnit: i.purchase_unit as Unit,
        purchasePriceCents: i.purchase_price_cents,
        baseUnit: i.base_unit,
        densityOrUnitWeight: i.density_or_unit_weight,
        yieldPct: i.yield_pct,
      };
    }
    graph.recipes[recipe.id] = {
      id: recipe.id,
      portions: Number(portions) > 0 ? Number(portions) : 1,
      menuPriceCents: menuPrice === "" ? null : Math.round(Number(menuPrice) * 100),
      items: items
        .filter((it) => it.ingredientId && Number(it.qty) > 0)
        .map((it) => ({
          ingredientId: it.ingredientId,
          qty: Number(it.qty),
          unit: it.unit as Unit,
        })),
    };
    try {
      return costRecipe(recipe.id, graph, { targetFoodCostPct, orangeBandPoints: 5 });
    } catch {
      return null;
    }
  }, [ingredients, items, portions, menuPrice, recipe.id, targetFoodCostPct]);

  const suggested = useMemo(() => {
    if (!cost || cost.missingPrice) return null;
    try {
      return suggestedPrice(cost.costPerPortionCents, targetFoodCostPct);
    } catch {
      return null;
    }
  }, [cost, targetFoodCostPct]);

  function addItem() {
    const first = ingredients[0];
    if (!first) return;
    setItems((prev) => [
      ...prev,
      { ingredientId: first.id, qty: "", unit: unitsForBase(first.base_unit)[0] ?? "unit" },
    ]);
  }

  function updateItem(index: number, patch: Partial<ItemState>) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const next = { ...it, ...patch };
        if (patch.ingredientId) {
          const ing = ingredientById.get(patch.ingredientId);
          if (ing) next.unit = unitsForBase(ing.base_unit)[0] ?? "unit";
        }
        return next;
      }),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("id", recipe.id);
    fd.set("name", name);
    fd.set("category", category);
    fd.set("type", recipe.type);
    fd.set("portions", portions);
    fd.set("menuPrice", menuPrice);
    fd.set(
      "items",
      JSON.stringify(
        items
          .filter((it) => it.ingredientId && Number(it.qty) > 0)
          .map((it) => ({ ingredientId: it.ingredientId, qty: Number(it.qty), unit: it.unit })),
      ),
    );
    startTransition(async () => {
      await saveRecipe(fd);
    });
  }

  function archive() {
    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("id", recipe.id);
    startTransition(async () => {
      await archiveRecipe(fd);
    });
  }

  const statusTone = STATUS_TONE[cost?.status ?? "no_price"];

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Editor form */}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-heading">{t("fieldName")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="recipe-name"
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-heading">{t("fieldCategory")}</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-heading">{t("fieldPortions")}</span>
            <input
              type="number"
              step="any"
              min="0.01"
              data-testid="recipe-portions"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-heading">
              {t("fieldMenuPrice")} ({currency})
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              data-testid="recipe-menuPrice"
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
              className="input"
            />
          </label>
        </div>

        {/* Items */}
        <div className="rounded-lg border border-border bg-container p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-heading">{t("items")}</h2>
            <button
              type="button"
              onClick={addItem}
              disabled={ingredients.length === 0}
              data-testid="recipe-add-item"
              className="text-sm text-accent-text hover:underline disabled:opacity-40"
            >
              + {t("addItem")}
            </button>
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-sm text-text">{t("noItems")}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((it, index) => {
                const ing = ingredientById.get(it.ingredientId);
                const unitOpts = ing ? unitsForBase(ing.base_unit) : (["unit"] as string[]);
                return (
                  <div
                    key={index}
                    data-testid="recipe-item-row"
                    className="grid grid-cols-[1fr_80px_90px_auto] items-center gap-2"
                  >
                    <select
                      value={it.ingredientId}
                      onChange={(e) => updateItem(index, { ingredientId: e.target.value })}
                      data-testid="recipe-item-ingredient"
                      className="input !mt-0"
                    >
                      {ingredients.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={it.qty}
                      onChange={(e) => updateItem(index, { qty: e.target.value })}
                      data-testid="recipe-item-qty"
                      className="input !mt-0"
                      placeholder={t("colQty")}
                    />
                    <select
                      value={it.unit}
                      onChange={(e) => updateItem(index, { unit: e.target.value })}
                      data-testid="recipe-item-unit"
                      className="input !mt-0"
                    >
                      {unitOpts.map((u) => (
                        <option key={u} value={u}>
                          {unitLabel(u)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-2 text-text hover:text-red-400"
                      aria-label={t("remove")}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={isPending}
            data-testid="recipe-save"
            className="btn-accent justify-center"
          >
            {isPending ? tc("saving") : tc("save")}
          </button>
          <button onClick={archive} disabled={isPending} className="btn-ghost justify-center">
            {tc("archive")}
          </button>
        </div>
      </div>

      {/* Live cost panel */}
      <aside className="h-fit rounded-lg border border-border-accent bg-container p-6 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-text">
          {t("costPanel")}
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label={t("total")} value={formatMoneyCents(cost?.totalCostCents, currency, locale)} />
          <Row
            label={t("perPortion")}
            value={formatMoneyCents(cost?.costPerPortionCents, currency, locale)}
          />
          <Row label={t("suggested")} value={formatMoneyCents(suggested, currency, locale)} />
          <Row
            label={`${t("foodCost")} (${t("target")} ${targetFoodCostPct}%)`}
            value={cost && !cost.missingPrice ? formatPct(cost.foodCostPct, locale) : t("noPrice")}
            testId="cost-fc"
          />
          <Row label={t("margin")} value={formatMoneyCents(cost?.marginCents ?? null, currency, locale)} />
        </dl>
        <div className={`mt-5 inline-block rounded-xs border px-3 py-1.5 text-sm font-medium ${statusTone}`}>
          {ts(cost?.status ?? "no_price")}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-text">{label}</dt>
      <dd className="font-semibold text-heading" data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}
