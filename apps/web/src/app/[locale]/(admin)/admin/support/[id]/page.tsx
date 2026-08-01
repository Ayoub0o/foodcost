import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { replyToTicket } from "../actions";

const CANNED = {
  en: [
    {
      label: "Thanks — looking into it",
      body: "Thanks for reaching out. I'm looking into this and will get back to you shortly.",
    },
    {
      label: "Try recompute",
      body: "Please edit and re-save the ingredient price so the cost cache refreshes, then check Overview for alerts.",
    },
  ],
  fr: [
    {
      label: "Merci — en cours",
      body: "Merci pour votre message. Je regarde ça et je vous réponds rapidement.",
    },
    {
      label: "Recalculer",
      body: "Modifiez puis réenregistrez le prix de l'ingrédient pour rafraîchir le cache, puis vérifiez l'aperçu pour les alertes.",
    },
  ],
};

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.support");
  const admin = createServiceRoleClient();

  const { data: ticket } = await admin.from("support_tickets").select("*").eq("id", id).maybeSingle();
  if (!ticket) notFound();

  const { data: messages } = await admin
    .from("support_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const canned = CANNED[locale === "fr" ? "fr" : "en"];

  return (
    <div className="container-bringer py-10" data-testid="admin-ticket-detail">
      <PageHeader title={ticket.subject} subtitle={ticket.email} />
      <p className="mt-2 text-sm text-text">
        {t(`status.${ticket.status}`)} · {ticket.category ?? "—"}
      </p>

      <div className="mt-8 space-y-3">
        {(messages ?? []).map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border p-4 text-sm ${
              m.author === "admin"
                ? "border-border-accent bg-accent/5"
                : "border-border bg-container"
            }`}
          >
            <p className="text-xs text-text">
              {m.author === "admin" ? t("admin") : t("user")} ·{" "}
              {new Date(m.created_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-heading">{m.body}</p>
          </div>
        ))}
      </div>

      <form action={replyToTicket} className="mt-8 max-w-2xl space-y-4" data-testid="admin-reply-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="ticketId" value={ticket.id} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
            {t("canned")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {canned.map((c) => (
              <button
                key={c.label}
                type="button"
                formAction={undefined}
                className="rounded-xs border border-border px-2 py-1 text-xs text-text"
                // Server component can't attach onClick — render as data for client enhancement
                data-canned={c.body}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-text">{t("cannedHint")}</p>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-heading">{t("reply")}</span>
          <textarea
            name="body"
            required
            rows={5}
            data-testid="admin-reply-body"
            defaultValue={canned[0]?.body ?? ""}
            className="input mt-1 min-h-[120px]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="block text-sm">
            <span className="text-heading">{t("colStatus")}</span>
            <select name="status" defaultValue="pending" className="input mt-1">
              <option value="open">{t("status.open")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="resolved">{t("status.resolved")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-heading">
            <input type="checkbox" name="productGap" defaultChecked={ticket.product_gap} />
            product-gap
          </label>
        </div>

        <button type="submit" data-testid="admin-reply-send" className="btn-accent">
          {t("send")}
        </button>
      </form>
    </div>
  );
}
