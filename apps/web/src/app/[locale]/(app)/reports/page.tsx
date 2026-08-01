import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { ReportsClient } from "@/components/app/ReportsClient";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import type { AppLocale, ExportsLogRow } from "@/lib/supabase/database.types";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);

  const supabase = await createClient();
  const { data } = await supabase
    .from("exports_log")
    .select("*")
    .eq("workspace_id", session.workspace.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const history = ((data ?? []) as ExportsLogRow[]).map((h) => ({
    id: h.id,
    kind: h.kind,
    status: h.status,
    file_path: h.file_path,
    created_at: h.created_at,
  }));

  const t = await getTranslations("App.reports");

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReportsClient
        locale={locale}
        workspaceId={session.workspace.id}
        history={history}
      />
    </div>
  );
}
