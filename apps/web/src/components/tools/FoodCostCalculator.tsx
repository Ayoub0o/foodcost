"use client";

import { useMemo, useState } from "react";
import {
  dimensionOf,
  foodCostPct,
  itemCost,
  statusFor,
  suggestedPrice,
  type BaseUnit,
  type CostStatus,
  type Unit,
} from "@foodcost/costing-engine";

interface Row {
  id: string;
  name: string;
  /** purchase price in major currency units (e.g. dollars) */
  price: string;
  purchaseQty: string;
  purchaseUnit: Unit;
  useQty: string;
  useUnit: Unit;
  yieldPct: string;
}

export interface CalculatorLabels {
  ingredient: string;
  price: string;
  purchaseQty: string;
  useQty: string;
  yieldPct: string;
  addRow: string;
  remove: string;
  settings: string;
  currency: string;
  portions: string;
  targetFc: string;
  menuPrice: string;
  results: string;
  totalCost: string;
  costPerPortion: string;
  foodCost: string;
  suggestedPrice: string;
  margin: string;
  status: string;
  downloadPdf: string;
  trialCta: string;
  statusGreen: string;
  statusOrange: string;
  statusRed: string;
  statusNoPrice: string;
}

const MASS_UNITS: Unit[] = ["g", "kg", "oz", "lb"];
const VOLUME_UNITS: Unit[] = ["ml", "cl", "l", "tsp", "tbsp", "cup", "fl_oz"];
const COUNT_UNITS: Unit[] = ["unit"];
const ALL_UNITS: Unit[] = [...MASS_UNITS, ...VOLUME_UNITS, ...COUNT_UNITS];

const CURRENCIES: Record<string, string> = {
  CAD: "$",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function baseUnitFor(unit: Unit): BaseUnit {
  const d = dimensionOf(unit);
  return d === "mass" ? "g" : d === "volume" ? "ml" : "unit";
}

function toCents(value: string): number {
  const n = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function num(value: string): number {
  const n = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

let counter = 0;
function newRow(): Row {
  counter += 1;
  return {
    id: `row-${counter}`,
    name: "",
    price: "",
    purchaseQty: "",
    purchaseUnit: "kg",
    useQty: "",
    useUnit: "g",
    yieldPct: "100",
  };
}

const STATUS_CLASS: Record<CostStatus, string> = {
  green: "text-emerald-400",
  orange: "text-amber-400",
  red: "text-red-400",
  no_price: "text-text",
};

export function FoodCostCalculator({
  labels,
  trialHref,
}: {
  labels: CalculatorLabels;
  trialHref: string;
}) {
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow()]);
  const [currency, setCurrency] = useState<string>("CAD");
  const [portions, setPortions] = useState<string>("1");
  const [targetFc, setTargetFc] = useState<string>("30");
  const [menuPrice, setMenuPrice] = useState<string>("");

  const symbol = CURRENCIES[currency] ?? "$";

  const result = useMemo(() => {
    let totalCents = 0;
    let anyPriced = false;
    for (const r of rows) {
      const priceCents = toCents(r.price);
      const pQty = num(r.purchaseQty);
      const uQty = num(r.useQty);
      if (priceCents <= 0 || pQty <= 0 || uQty <= 0) continue;
      // Purchase and use units must share a dimension in the free calculator.
      if (dimensionOf(r.purchaseUnit) !== dimensionOf(r.useUnit)) continue;
      const yieldPct = Math.min(100, Math.max(1, num(r.yieldPct) || 100));
      const cost = itemCost(
        {
          id: r.id,
          purchaseQty: pQty,
          purchaseUnit: r.purchaseUnit,
          purchasePriceCents: priceCents,
          baseUnit: baseUnitFor(r.purchaseUnit),
          yieldPct,
        },
        uQty,
        r.useUnit,
      );
      if (cost != null) {
        totalCents += cost;
        anyPriced = true;
      }
    }

    const portionCount = Math.max(1, num(portions) || 1);
    const perPortion = Math.round(totalCents / portionCount);
    const target = Math.min(99, Math.max(1, num(targetFc) || 30));
    const menuCents = toCents(menuPrice);
    const pct = anyPriced ? foodCostPct(perPortion, menuCents) : null;
    const suggested = anyPriced ? suggestedPrice(perPortion, target) : 0;
    const margin = menuCents > 0 && anyPriced ? menuCents - perPortion : null;
    const status: CostStatus = anyPriced ? statusFor(pct, target) : "no_price";

    return {
      totalCents: Math.round(totalCents),
      perPortion,
      pct,
      suggested,
      margin,
      status,
      anyPriced,
    };
  }, [rows, portions, targetFc, menuPrice]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function fmt(cents: number): string {
    return `${symbol}${(cents / 100).toFixed(2)}`;
  }

  function handlePrint() {
    document.body.classList.add("printing-calc");
    const cleanup = () => {
      document.body.classList.remove("printing-calc");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  const statusLabel =
    result.status === "green"
      ? labels.statusGreen
      : result.status === "orange"
        ? labels.statusOrange
        : result.status === "red"
          ? labels.statusRed
          : labels.statusNoPrice;

  return (
    <div className="rounded-lg border border-border bg-container p-6 md:p-8" id="calculator">
      {/* Ingredient rows */}
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-2 gap-3 rounded-sm border border-border-mute p-4 lg:grid-cols-12">
            <input
              className="col-span-2 rounded-xs border border-border bg-body px-3 py-2 text-sm text-heading outline-none focus:border-border-accent lg:col-span-3"
              placeholder={labels.ingredient}
              value={r.name}
              onChange={(e) => updateRow(r.id, { name: e.target.value })}
            />
            <div className="flex items-center rounded-xs border border-border bg-body lg:col-span-2">
              <span className="pl-3 text-sm text-text">{symbol}</span>
              <input
                className="w-full bg-transparent px-2 py-2 text-sm text-heading outline-none"
                placeholder={labels.price}
                inputMode="decimal"
                value={r.price}
                onChange={(e) => updateRow(r.id, { price: e.target.value })}
              />
            </div>
            <div className="flex gap-1 lg:col-span-3">
              <input
                className="w-full rounded-xs border border-border bg-body px-3 py-2 text-sm text-heading outline-none focus:border-border-accent"
                placeholder={labels.purchaseQty}
                inputMode="decimal"
                value={r.purchaseQty}
                onChange={(e) => updateRow(r.id, { purchaseQty: e.target.value })}
              />
              <select
                className="rounded-xs border border-border bg-body px-2 py-2 text-sm text-heading outline-none"
                value={r.purchaseUnit}
                onChange={(e) => updateRow(r.id, { purchaseUnit: e.target.value as Unit })}
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1 lg:col-span-3">
              <input
                className="w-full rounded-xs border border-border bg-body px-3 py-2 text-sm text-heading outline-none focus:border-border-accent"
                placeholder={labels.useQty}
                inputMode="decimal"
                value={r.useQty}
                onChange={(e) => updateRow(r.id, { useQty: e.target.value })}
              />
              <select
                className="rounded-xs border border-border bg-body px-2 py-2 text-sm text-heading outline-none"
                value={r.useUnit}
                onChange={(e) => updateRow(r.id, { useUnit: e.target.value as Unit })}
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((x) => x.id !== r.id) : prev))}
              className="col-span-2 text-xs text-text hover:text-heading lg:col-span-1"
              aria-label={labels.remove}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="btn-ghost mt-4 !py-2 text-sm"
      >
        + {labels.addRow}
      </button>

      {/* Settings */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border-mute pt-6 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-text">{labels.currency}</span>
          <select
            className="w-full rounded-xs border border-border bg-body px-3 py-2 text-heading outline-none"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text">{labels.portions}</span>
          <input
            className="w-full rounded-xs border border-border bg-body px-3 py-2 text-heading outline-none"
            inputMode="decimal"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text">{labels.targetFc}</span>
          <input
            className="w-full rounded-xs border border-border bg-body px-3 py-2 text-heading outline-none"
            inputMode="decimal"
            value={targetFc}
            onChange={(e) => setTargetFc(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text">{labels.menuPrice}</span>
          <input
            className="w-full rounded-xs border border-border bg-body px-3 py-2 text-heading outline-none"
            inputMode="decimal"
            placeholder={symbol}
            value={menuPrice}
            onChange={(e) => setMenuPrice(e.target.value)}
          />
        </label>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-sm border border-border-accent bg-body/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-text">
          {labels.results}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          <Metric label={labels.totalCost} value={fmt(result.totalCents)} />
          <Metric label={labels.costPerPortion} value={fmt(result.perPortion)} />
          <Metric label={labels.suggestedPrice} value={fmt(result.suggested)} />
          <Metric label={labels.foodCost} value={result.pct != null ? `${result.pct}%` : "—"} />
          <Metric label={labels.margin} value={result.margin != null ? fmt(result.margin) : "—"} />
          <Metric
            label={labels.status}
            value={statusLabel}
            className={STATUS_CLASS[result.status]}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handlePrint} className="btn-ghost">
          {labels.downloadPdf}
        </button>
        <a href={trialHref} className="btn-accent">
          {labels.trialCta}
        </a>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-text">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.03em] text-heading ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
