import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import type { ExportKind, RecipeCostCacheRow, RecipeRow } from "@/lib/supabase/database.types";

export async function generateExportWorkbook(
  workspaceId: string,
  kind: Exclude<ExportKind, "tech_sheet_pdf">,
): Promise<{ buffer: Buffer; filename: string }> {
  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("name,currency")
    .eq("id", workspaceId)
    .single();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FoodCost by PixPlat";
  workbook.created = new Date();

  if (kind === "catalog") {
    await buildCatalog(workbook, workspaceId);
  } else if (kind === "recipe_book") {
    await buildRecipeBook(workbook, workspaceId);
  } else {
    await buildProfitability(workbook, workspaceId);
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const slug = (ws?.name ?? "workspace").replace(/[^\w\-]+/g, "_").slice(0, 40);
  const filename = `${slug}_${kind}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  return { buffer, filename };
}

async function buildCatalog(workbook: ExcelJS.Workbook, workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ingredients")
    .select(
      "name,supplier_name,purchase_qty,purchase_unit,purchase_price_cents,base_unit,yield_pct,allergens",
    )
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("name");

  const sheet = workbook.addWorksheet("Ingredient catalog");
  sheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Supplier", key: "supplier", width: 20 },
    { header: "Purchase qty", key: "qty", width: 14 },
    { header: "Purchase unit", key: "unit", width: 14 },
    { header: "Price", key: "price", width: 12 },
    { header: "Base unit", key: "base", width: 12 },
    { header: "Yield %", key: "yield", width: 10 },
    { header: "Allergens", key: "allergens", width: 24 },
  ];
  for (const row of data ?? []) {
    sheet.addRow({
      name: row.name,
      supplier: row.supplier_name ?? "",
      qty: Number(row.purchase_qty),
      unit: row.purchase_unit,
      price: row.purchase_price_cents / 100,
      base: row.base_unit,
      yield: Number(row.yield_pct),
      allergens: (row.allergens ?? []).join(", "),
    });
  }
  styleHeader(sheet);
}

async function buildRecipeBook(workbook: ExcelJS.Workbook, workspaceId: string) {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,name,category,type,portions,menu_price_cents")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("name");

  const sheet = workbook.addWorksheet("Recipe book");
  sheet.columns = [
    { header: "Recipe", key: "name", width: 28 },
    { header: "Category", key: "category", width: 16 },
    { header: "Type", key: "type", width: 12 },
    { header: "Portions", key: "portions", width: 10 },
    { header: "Menu price", key: "price", width: 12 },
    { header: "Food cost %", key: "fc", width: 12 },
    { header: "Cost / portion", key: "cpp", width: 14 },
  ];

  const ids = (recipes ?? []).map((r) => r.id);
  const cacheById = new Map<string, RecipeCostCacheRow>();
  if (ids.length > 0) {
    const { data: cache } = await supabase.from("recipe_cost_cache").select("*").in("recipe_id", ids);
    for (const c of (cache ?? []) as RecipeCostCacheRow[]) cacheById.set(c.recipe_id, c);
  }

  for (const r of (recipes ?? []) as Pick<
    RecipeRow,
    "id" | "name" | "category" | "type" | "portions" | "menu_price_cents"
  >[]) {
    const c = cacheById.get(r.id);
    sheet.addRow({
      name: r.name,
      category: r.category ?? "",
      type: r.type,
      portions: Number(r.portions),
      price: r.menu_price_cents == null ? "" : r.menu_price_cents / 100,
      fc: c?.food_cost_pct == null ? "" : Number(c.food_cost_pct),
      cpp: c == null ? "" : c.cost_per_portion_cents / 100,
    });
  }
  styleHeader(sheet);
}

async function buildProfitability(workbook: ExcelJS.Workbook, workspaceId: string) {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,name,category,menu_price_cents")
    .eq("workspace_id", workspaceId)
    .eq("type", "dish")
    .is("archived_at", null)
    .order("name");

  const sheet = workbook.addWorksheet("Profitability");
  sheet.columns = [
    { header: "Dish", key: "name", width: 28 },
    { header: "Category", key: "category", width: 16 },
    { header: "Cost / portion", key: "cost", width: 14 },
    { header: "Menu price", key: "price", width: 12 },
    { header: "Food cost %", key: "fc", width: 12 },
    { header: "Margin", key: "margin", width: 12 },
    { header: "Status", key: "status", width: 12 },
  ];

  const ids = (recipes ?? []).map((r) => r.id);
  const cacheById = new Map<string, RecipeCostCacheRow>();
  if (ids.length > 0) {
    const { data: cache } = await supabase.from("recipe_cost_cache").select("*").in("recipe_id", ids);
    for (const c of (cache ?? []) as RecipeCostCacheRow[]) cacheById.set(c.recipe_id, c);
  }

  for (const r of recipes ?? []) {
    const c = cacheById.get(r.id);
    sheet.addRow({
      name: r.name,
      category: r.category ?? "",
      cost: c == null ? "" : c.cost_per_portion_cents / 100,
      price: r.menu_price_cents == null ? "" : r.menu_price_cents / 100,
      fc: c?.food_cost_pct == null ? "" : Number(c.food_cost_pct),
      margin: c?.margin_cents == null ? "" : c.margin_cents / 100,
      status: c?.status ?? "no_price",
    });
  }
  styleHeader(sheet);
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1);
  row.font = { bold: true };
  row.commit();
}
