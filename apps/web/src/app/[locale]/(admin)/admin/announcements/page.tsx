import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/app/PageHeader";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { deleteAnnouncement, upsertAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.announcements");
  const admin = createServiceRoleClient();
  const { data: rows } = await admin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container-bringer py-10">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <form action={upsertAnnouncement} className="mt-8 max-w-xl space-y-4 rounded-lg border border-border bg-container p-6">
        <input type="hidden" name="locale" value={locale} />
        <h2 className="text-lg font-semibold text-heading">{t("create")}</h2>
        <label className="block">
          <span className="text-sm text-heading">{t("fieldTitle")}</span>
          <input name="title" required className="input mt-1" data-testid="announcement-title" />
        </label>
        <label className="block">
          <span className="text-sm text-heading">{t("fieldBody")}</span>
          <textarea name="body" required rows={3} className="input mt-1" data-testid="announcement-body" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-heading">{t("fieldLevel")}</span>
            <select name="level" className="input mt-1">
              <option value="info">info</option>
              <option value="warning">warning</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-heading">{t("fieldLocale")}</span>
            <select name="annLocale" className="input mt-1">
              <option value="">{t("allLocales")}</option>
              <option value="en">en</option>
              <option value="fr">fr</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-heading">
          <input type="checkbox" name="active" defaultChecked />
          {t("active")}
        </label>
        <button type="submit" className="btn-accent" data-testid="announcement-save">
          {t("save")}
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {(rows ?? []).map((a) => (
          <li key={a.id} className="rounded-lg border border-border bg-container p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-heading">
                  {a.title}{" "}
                  <span className="text-xs text-text">
                    ({a.level}
                    {a.locale ? ` · ${a.locale}` : ""}
                    {a.active ? "" : ` · ${t("inactive")}`})
                  </span>
                </p>
                <p className="mt-1 text-sm text-text">{a.body}</p>
              </div>
              <form action={deleteAnnouncement}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-xs text-red-400 hover:underline">
                  {t("delete")}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
