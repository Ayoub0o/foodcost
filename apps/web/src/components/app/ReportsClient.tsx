"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ExportKind, ExportStatus } from "@/lib/supabase/database.types";

export interface ExportLogDTO {
  id: string;
  kind: ExportKind;
  status: ExportStatus;
  file_path: string | null;
  created_at: string;
}

const CARDS: Exclude<ExportKind, "tech_sheet_pdf">[] = [
  "profitability",
  "recipe_book",
  "catalog",
];

export function ReportsClient({
  locale,
  workspaceId,
  history,
}: {
  locale: string;
  workspaceId: string;
  history: ExportLogDTO[];
}) {
  const t = useTranslations("App.reports");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyKind, setBusyKind] = useState<string | null>(null);

  function runExport(kind: Exclude<ExportKind, "tech_sheet_pdf">) {
    setError(null);
    setBusyKind(kind);
    startTransition(async () => {
      try {
        const res = await fetch(`/foodcost/api/exports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, workspaceId }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition") ?? "";
        const match = /filename="([^"]+)"/.exec(disposition);
        const filename = match?.[1] ?? `${kind}.xlsx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("error"));
      } finally {
        setBusyKind(null);
      }
    });
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((kind) => (
          <div
            key={kind}
            className="rounded-lg border border-border bg-container p-6"
            data-testid={`export-card-${kind}`}
          >
            <h2 className="text-lg font-semibold text-heading">{t(`kinds.${kind}.title`)}</h2>
            <p className="mt-2 text-sm text-text">{t(`kinds.${kind}.body`)}</p>
            <button
              type="button"
              data-testid={`export-${kind}`}
              disabled={isPending}
              onClick={() => runExport(kind)}
              className="btn-accent mt-6 !px-4 !py-2 text-sm"
            >
              {busyKind === kind ? t("generating") : t("download")}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-xs border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-border bg-container p-6" data-testid="exports-history">
        <h2 className="text-lg font-semibold text-heading">{t("history")}</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-text">{t("historyEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-mute">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-heading">{t(`kinds.${h.kind}.title`)}</p>
                  <p className="text-xs text-text">
                    {new Date(h.created_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
                  </p>
                </div>
                <span className="text-xs text-text">{t(`status.${h.status}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
