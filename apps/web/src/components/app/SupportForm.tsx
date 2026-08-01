"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createSupportTicket } from "@/app/[locale]/(admin)/admin/support/actions";

export function SupportForm({
  locale,
  page,
  compact = false,
}: {
  locale: string;
  page?: string;
  compact?: boolean;
}) {
  const t = useTranslations("App.support");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("locale", locale);
    if (page) fd.set("page", page);
    setError(null);
    startTransition(async () => {
      try {
        const res = await createSupportTicket(fd);
        if (res.ok) setDone(res.ticketId ?? "ok");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error"));
      }
    });
  }

  if (done) {
    return (
      <p className="rounded-xs border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400" data-testid="support-sent">
        {t("sent")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "mt-6 max-w-lg space-y-4"} data-testid="support-form">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="block">
        <span className="text-sm font-medium text-heading">{t("subject")}</span>
        <input name="subject" required data-testid="support-subject" className="input mt-1" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-heading">{t("category")}</span>
        <select name="category" data-testid="support-category" className="input mt-1">
          <option value="question">{t("categories.question")}</option>
          <option value="billing">{t("categories.billing")}</option>
          <option value="bug">{t("categories.bug")}</option>
          <option value="data">{t("categories.data")}</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-heading">{t("message")}</span>
        <textarea name="body" required rows={compact ? 3 : 5} data-testid="support-body" className="input mt-1" />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={isPending} data-testid="support-submit" className="btn-accent !px-4 !py-2 text-sm">
        {isPending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
