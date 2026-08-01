import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { TicketStatus } from "@/lib/supabase/database.types";

export default async function AdminSupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.support");
  const admin = createServiceRoleClient();

  const statusFilter =
    status === "open" || status === "pending" || status === "resolved"
      ? (status as TicketStatus)
      : null;

  let query = admin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  const { data: tickets } = await query;

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-6 flex gap-2 text-sm">
        {(["", "open", "pending", "resolved"] as const).map((s) => {
          const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";
          const href = s
            ? `${base}/${locale}/admin/support?status=${s}`
            : `${base}/${locale}/admin/support`;
          return (
            <a
              key={s || "all"}
              href={href}
              className="rounded-xs border border-border px-3 py-1.5 text-text hover:border-border-accent hover:text-heading"
            >
              {s ? t(`status.${s}`) : t("statusAll")}
            </a>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm" data-testid="admin-tickets-table">
          <thead className="bg-container text-heading">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("colSubject")}</th>
              <th className="px-4 py-3 font-semibold">{t("colEmail")}</th>
              <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
              <th className="px-4 py-3 font-semibold">{t("colCreated")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(tickets ?? []).map((ticket) => (
              <tr key={ticket.id} className="border-t border-border-mute" data-testid="admin-ticket-row">
                <td className="px-4 py-3 font-medium text-heading">
                  {ticket.subject}
                  {ticket.product_gap && (
                    <span className="ml-2 rounded-xs border border-amber-500/40 px-1.5 py-0.5 text-[10px] text-amber-400">
                      product-gap
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text">{ticket.email}</td>
                <td className="px-4 py-3 text-heading">{t(`status.${ticket.status}`)}</td>
                <td className="px-4 py-3 text-text">
                  {new Date(ticket.created_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={{ pathname: "/admin/support/[id]", params: { id: ticket.id } }}
                    className="text-accent-text hover:underline"
                    data-testid="admin-ticket-open"
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
