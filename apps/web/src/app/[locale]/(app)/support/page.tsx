import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { SupportForm } from "@/components/app/SupportForm";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspace } from "@/lib/workspace";
import type { AppLocale, SupportMessageRow, SupportTicketRow } from "@/lib/supabase/database.types";

export default async function UserSupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { locale } = await params;
  const { ticket: ticketId } = await searchParams;
  setRequestLocale(locale);

  const session = await getCurrentUserWorkspace(locale as AppLocale);
  if (!session) redirect(`/${locale}/login`);

  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  let messages: SupportMessageRow[] = [];
  let active: SupportTicketRow | null = null;
  if (ticketId) {
    const { data: t } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    active = (t as SupportTicketRow | null) ?? null;
    if (active) {
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", active.id)
        .order("created_at", { ascending: true });
      messages = (msgs ?? []) as SupportMessageRow[];
    }
  }

  const t = await getTranslations("App.support");

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SupportForm locale={locale} page="support" />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-heading">{t("history")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {((tickets ?? []) as SupportTicketRow[]).map((tk) => (
              <li key={tk.id}>
                <a
                  href={`/${locale}/support?ticket=${tk.id}`}
                  className="text-accent-text hover:underline"
                  data-testid="user-ticket-link"
                >
                  {tk.subject} · {tk.status}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {active && (
          <div data-testid="user-ticket-thread">
            <h2 className="text-lg font-semibold text-heading">{active.subject}</h2>
            <div className="mt-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-lg border border-border bg-container p-3 text-sm">
                  <p className="text-xs text-text">{m.author}</p>
                  <p className="mt-1 whitespace-pre-wrap text-heading">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
