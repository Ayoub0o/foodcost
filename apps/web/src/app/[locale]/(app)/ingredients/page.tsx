import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { IngredientsClient, type IngredientDTO } from "@/components/app/IngredientsClient";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import type { AppLocale, IngredientRow } from "@/lib/supabase/database.types";

export default async function IngredientsPage({
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
  const { data } = await supabase
    .from("ingredients")
    .select("*")
    .eq("workspace_id", workspace.id)
    .is("archived_at", null)
    .order("name", { ascending: true });

  const ingredients: IngredientDTO[] = ((data ?? []) as IngredientRow[]).map((i) => ({
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

  const t = await getTranslations("App.ingredients");

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <IngredientsClient ingredients={ingredients} locale={locale} currency={workspace.currency} />
    </div>
  );
}
