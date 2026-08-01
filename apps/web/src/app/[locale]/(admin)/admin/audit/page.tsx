import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { locale } = await params;
  const { action } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.audit");
  const admin = createServiceRoleClient();

  let query = admin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (action) query = query.eq("action", action);
  const { data: rows } = await query;

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm" data-testid="admin-audit-table">
          <thead className="bg-container text-heading">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("colWhen")}</th>
              <th className="px-4 py-3 font-semibold">{t("colAction")}</th>
              <th className="px-4 py-3 font-semibold">{t("colTarget")}</th>
              <th className="px-4 py-3 font-semibold">{t("colMeta")}</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border-mute" data-testid="admin-audit-row">
                <td className="px-4 py-3 text-text">
                  {new Date(r.created_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
                </td>
                <td className="px-4 py-3 font-medium text-heading" data-testid="audit-action">
                  {r.action}
                </td>
                <td className="px-4 py-3 text-text">
                  {r.target_type ?? "—"}
                  {r.target_id ? ` · ${r.target_id.slice(0, 8)}` : ""}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-text">
                  {JSON.stringify(r.meta ?? {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
