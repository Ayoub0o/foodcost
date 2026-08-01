import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.customers");
  const admin = createServiceRoleClient();

  const [{ data: workspaces }, { data: authUsers }] = await Promise.all([
    admin
      .from("workspaces")
      .select("id,name,plan,trial_ends_at,created_at,owner_id,locale")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    // One Auth list call instead of N× getUserById (was the admin customers bottleneck).
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const emailByOwner = new Map<string, string>();
  for (const u of authUsers?.users ?? []) {
    if (u.email) emailByOwner.set(u.id, u.email);
  }

  const query = (q ?? "").trim().toLowerCase();
  const rows = (workspaces ?? [])
    .map((w) => ({
      ...w,
      email: emailByOwner.get(w.owner_id) ?? "—",
    }))
    .filter((w) => {
      if (!query) return true;
      return (
        w.name.toLowerCase().includes(query) ||
        w.email.toLowerCase().includes(query) ||
        w.id.includes(query)
      );
    });

  // Recipe counts
  const counts = new Map<string, number>();
  if (rows.length > 0) {
    const { data: recipes } = await admin
      .from("recipes")
      .select("workspace_id")
      .in(
        "workspace_id",
        rows.map((r) => r.id),
      )
      .is("archived_at", null);
    for (const r of recipes ?? []) {
      counts.set(r.workspace_id, (counts.get(r.workspace_id) ?? 0) + 1);
    }
  }

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <form className="mt-6" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("search")}
          data-testid="admin-customer-search"
          className="input max-w-md"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm" data-testid="admin-customers-table">
          <thead className="bg-container text-heading">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("colName")}</th>
              <th className="px-4 py-3 font-semibold">{t("colEmail")}</th>
              <th className="px-4 py-3 font-semibold">{t("colPlan")}</th>
              <th className="px-4 py-3 font-semibold">{t("colTrial")}</th>
              <th className="px-4 py-3 font-semibold">{t("colRecipes")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t border-border-mute" data-testid="admin-customer-row">
                <td className="px-4 py-3 font-medium text-heading">{w.name}</td>
                <td className="px-4 py-3 text-text">{w.email}</td>
                <td className="px-4 py-3 text-heading">{w.plan}</td>
                <td className="px-4 py-3 text-text">
                  {new Date(w.trial_ends_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                </td>
                <td className="px-4 py-3 text-text">{counts.get(w.id) ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={{ pathname: "/admin/customers/[id]", params: { id: w.id } }}
                    className="text-accent-text hover:underline"
                    data-testid="admin-customer-open"
                  >
                    {t("open")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
