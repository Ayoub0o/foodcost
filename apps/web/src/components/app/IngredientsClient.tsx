"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { effectiveUnitCost, type BaseUnit, type Unit } from "@foodcost/costing-engine";
import { BASE_UNITS, unitLabel, unitsForBase, baseUnitLabel } from "@/lib/costing/units";
import { formatMoneyCents } from "@/lib/format";
import { createIngredient, updateIngredient, archiveIngredient } from "@/app/[locale]/(app)/ingredients/actions";
import { Toast } from "@/components/app/Toast";

export interface IngredientDTO {
  id: string;
  name: string;
  supplier_name: string | null;
  purchase_qty: number;
  purchase_unit: string;
  purchase_price_cents: number;
  base_unit: BaseUnit;
  density_or_unit_weight: number | null;
  yield_pct: number;
  allergens: string[];
  is_sample: boolean;
}

interface FormState {
  name: string;
  supplier: string;
  baseUnit: BaseUnit;
  purchaseQty: string;
  purchaseUnit: string;
  purchasePrice: string;
  density: string;
  yieldPct: string;
  allergens: string;
}

const EMPTY: FormState = {
  name: "",
  supplier: "",
  baseUnit: "g",
  purchaseQty: "",
  purchaseUnit: "g",
  purchasePrice: "",
  density: "",
  yieldPct: "100",
  allergens: "",
};

function usableCost(f: FormState, currency: string, locale: string): string {
  const qty = Number(f.purchaseQty);
  const price = Number(f.purchasePrice);
  const yieldPct = Number(f.yieldPct);
  if (!qty || !price || !yieldPct) return "—";
  try {
    const eff = effectiveUnitCost({
      id: "preview",
      purchaseQty: qty,
      purchaseUnit: f.purchaseUnit as Unit,
      purchasePriceCents: Math.round(price * 100),
      baseUnit: f.baseUnit,
      densityOrUnitWeight: f.density ? Number(f.density) : null,
      yieldPct,
    });
    if (eff == null) return "—";
    const per = f.baseUnit === "unit" ? eff : eff * 100;
    const suffix = f.baseUnit === "unit" ? "/unit" : `/100 ${f.baseUnit}`;
    return `${formatMoneyCents(Math.round(per), currency, locale)} ${suffix}`;
  } catch {
    return "—";
  }
}

export function IngredientsClient({
  ingredients,
  locale,
  currency,
}: {
  ingredients: IngredientDTO[];
  locale: string;
  currency: string;
}) {
  const t = useTranslations("App.ingredients");
  const tc = useTranslations("App.common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.supplier_name ?? "").toLowerCase().includes(q),
    );
  }, [ingredients, query]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setDrawerOpen(true);
  }

  function openEdit(ing: IngredientDTO) {
    setEditingId(ing.id);
    setForm({
      name: ing.name,
      supplier: ing.supplier_name ?? "",
      baseUnit: ing.base_unit,
      purchaseQty: String(ing.purchase_qty),
      purchaseUnit: ing.purchase_unit,
      purchasePrice: (ing.purchase_price_cents / 100).toString(),
      density: ing.density_or_unit_weight == null ? "" : String(ing.density_or_unit_weight),
      yieldPct: String(ing.yield_pct),
      allergens: ing.allergens.join(", "),
    });
    setDrawerOpen(true);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "baseUnit") {
        next.purchaseUnit = unitsForBase(value as BaseUnit)[0] ?? "unit";
      }
      return next;
    });
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("locale", locale);
    if (editingId) fd.set("id", editingId);
    fd.set("name", form.name);
    fd.set("supplier", form.supplier);
    fd.set("baseUnit", form.baseUnit);
    fd.set("purchaseQty", form.purchaseQty);
    fd.set("purchaseUnit", form.purchaseUnit);
    fd.set("purchasePrice", form.purchasePrice);
    fd.set("density", form.density);
    fd.set("yieldPct", form.yieldPct);
    fd.set("allergens", form.allergens);
    return fd;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = buildFormData();
    startTransition(async () => {
      if (editingId) {
        const summary = await updateIngredient(fd);
        if (summary && summary.recipesUpdated > 0) {
          setToast(
            t("propagateToast", {
              recipes: summary.recipesUpdated,
              alerts: summary.thresholdsCrossed,
            }),
          );
        }
      } else {
        await createIngredient(fd);
      }
      setDrawerOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("id", id);
    startTransition(async () => {
      await archiveIngredient(fd);
      router.refresh();
    });
  }

  const unitOptions = unitsForBase(form.baseUnit);

  return (
    <>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <div className="mt-6 flex items-center justify-between gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full max-w-xs rounded-xs border border-border bg-container px-3 py-2 text-sm text-heading outline-none focus:border-border-accent"
        />
        <button
          type="button"
          onClick={openCreate}
          data-testid="ingredient-new"
          className="btn-accent !px-4 !py-2 text-sm"
        >
          {t("new")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-semibold text-heading">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text">{t("emptyBody")}</p>
          <button type="button" onClick={openCreate} className="btn-accent mt-6 !px-4 !py-2 text-sm">
            {t("new")}
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-container text-heading">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("colName")}</th>
                <th className="px-4 py-3 font-semibold">{t("colSupplier")}</th>
                <th className="px-4 py-3 font-semibold">{t("colCost")}</th>
                <th className="px-4 py-3 font-semibold">{t("colYield")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => {
                const costLabel = usableCost(
                  {
                    ...EMPTY,
                    baseUnit: ing.base_unit,
                    purchaseQty: String(ing.purchase_qty),
                    purchaseUnit: ing.purchase_unit,
                    purchasePrice: String(ing.purchase_price_cents / 100),
                    density: ing.density_or_unit_weight == null ? "" : String(ing.density_or_unit_weight),
                    yieldPct: String(ing.yield_pct),
                  },
                  currency,
                  locale,
                );
                return (
                  <tr key={ing.id} className="border-t border-border-mute">
                    <td className="px-4 py-3">
                      <span className="font-medium text-heading">{ing.name}</span>
                      {ing.is_sample && (
                        <span className="ml-2 rounded-xs border border-border px-1.5 py-0.5 text-[10px] text-text">
                          {tc("example")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text">{ing.supplier_name ?? "—"}</td>
                    <td className="px-4 py-3 text-heading">{costLabel}</td>
                    <td className="px-4 py-3 text-text">{ing.yield_pct}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(ing)}
                        className="text-accent-text hover:underline"
                      >
                        {tc("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ing.id)}
                        disabled={isPending}
                        className="ml-4 text-text hover:text-red-400"
                      >
                        {tc("archive")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label={tc("cancel")}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <form
            onSubmit={submit}
            className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-container p-6"
          >
            <h2 className="text-lg font-semibold text-heading">
              {editingId ? t("editTitle") : t("createTitle")}
            </h2>

            <div className="mt-6 space-y-4">
              <Field label={t("fieldName")}>
                <input
                  required
                  data-testid="ingredient-name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label={`${t("fieldSupplier")} (${tc("optional")})`}>
                <input
                  data-testid="ingredient-supplier"
                  value={form.supplier}
                  onChange={(e) => update("supplier", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={t("fieldBaseUnit")}>
                <select
                  data-testid="ingredient-baseUnit"
                  value={form.baseUnit}
                  onChange={(e) => update("baseUnit", e.target.value as BaseUnit)}
                  className="input"
                >
                  {BASE_UNITS.map((b) => (
                    <option key={b} value={b}>
                      {baseUnitLabel(b, locale)}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label={t("fieldPurchaseQty")}>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0"
                    data-testid="ingredient-purchaseQty"
                    value={form.purchaseQty}
                    onChange={(e) => update("purchaseQty", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label={t("fieldPurchaseUnit")}>
                  <select
                    data-testid="ingredient-purchaseUnit"
                    value={form.purchaseUnit}
                    onChange={(e) => update("purchaseUnit", e.target.value)}
                    className="input"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {unitLabel(u)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("fieldPurchasePrice")}>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    data-testid="ingredient-purchasePrice"
                    value={form.purchasePrice}
                    onChange={(e) => update("purchasePrice", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("fieldYield")} help={t("fieldYieldHelp")}>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0.01"
                    max="100"
                    value={form.yieldPct}
                    onChange={(e) => update("yieldPct", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label={`${t("fieldDensity")} (${tc("optional")})`} help={t("fieldDensityHelp")}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.density}
                    onChange={(e) => update("density", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <Field label={`${t("fieldAllergens")} (${tc("optional")})`}>
                <input
                  value={form.allergens}
                  onChange={(e) => update("allergens", e.target.value)}
                  placeholder="gluten, milk"
                  className="input"
                />
              </Field>

              <div className="rounded-lg border border-border-accent bg-body/40 p-4">
                <p className="text-xs text-text">{t("preview")}</p>
                <p className="mt-1 text-xl font-semibold text-heading">
                  {usableCost(form, currency, locale)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                data-testid="ingredient-save"
                className="btn-accent flex-1 justify-center"
              >
                {isPending ? tc("saving") : tc("save")}
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-ghost flex-1 justify-center"
              >
                {tc("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-heading">{label}</span>
      {children}
      {help && <span className="mt-1 block text-xs text-text">{help}</span>}
    </label>
  );
}
