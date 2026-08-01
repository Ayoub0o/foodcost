import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signInWithGoogle, signInWithMagicLink } from "./actions";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next, sent, error } = await searchParams;
  const t = await getTranslations("Auth");
  const meta = await getTranslations("Meta");

  const nextValue = next ?? "";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/foodcost";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-container p-8">
        <Link href="/" className="mb-8 block text-sm font-semibold text-accent-text">
          {meta("siteName")}
        </Link>

        {sent ? (
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-heading">
              {t("checkEmailTitle")}
            </h1>
            <p className="mt-3 text-text">{t("checkEmailBody", { email: sent })}</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-heading">
              {t("loginTitle")}
            </h1>
            <p className="mt-2 text-sm text-text">{t("loginSubtitle")}</p>

            {error ? (
              <p
                className="mt-4 rounded-xs border border-border-accent bg-body/40 px-4 py-3 text-sm text-accent-text"
                role="alert"
              >
                {error === "credentials" ? t("errorCredentials") : t("errorGeneric")}
              </p>
            ) : null}

            <form
              action={`${basePath}/api/auth/password`}
              method="post"
              className="mt-6 space-y-4"
              data-testid="password-login"
            >
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={nextValue} />
              <label className="block text-sm font-medium text-heading" htmlFor="email">
                {t("emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue=""
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xs border border-border bg-body px-4 py-3 text-heading outline-none focus:border-border-accent"
              />
              <label className="block text-sm font-medium text-heading" htmlFor="password">
                {t("passwordLabel")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xs border border-border bg-body px-4 py-3 text-heading outline-none focus:border-border-accent"
              />
              <button type="submit" className="btn-accent w-full">
                {t("passwordButton")}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-text">
              <span className="h-px flex-1 bg-border-mute" />
              {t("or")}
              <span className="h-px flex-1 bg-border-mute" />
            </div>

            <form action={signInWithMagicLink} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={nextValue} />
              <label className="block text-sm font-medium text-heading" htmlFor="magic-email">
                {t("emailLabel")}
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xs border border-border bg-body px-4 py-3 text-heading outline-none focus:border-border-accent"
              />
              <button type="submit" className="btn-ghost w-full">
                {t("magicLinkButton")}
              </button>
            </form>

            <form action={signInWithGoogle} className="mt-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={nextValue} />
              <button type="submit" className="btn-ghost w-full">
                {t("googleButton")}
              </button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-text" data-testid="signup-legal-consent">
              {t.rich("acceptLegal", {
                terms: (chunks) => (
                  <Link href="/terms" className="text-accent-text underline">
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="/privacy" className="text-accent-text underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
