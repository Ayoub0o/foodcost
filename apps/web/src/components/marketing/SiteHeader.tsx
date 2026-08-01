import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { LocaleSwitcher } from "./LocaleSwitcher";

/** Marketing header built on the Bringer 2 header shell (tokens/typography). */
export async function SiteHeader() {
  const t = await getTranslations("Nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border-mute bg-nav/90 backdrop-blur">
      <div className="container-bringer flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-[-0.03em] text-heading">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/calculator" className="text-text transition-colors hover:text-heading">
            {t("calculator")}
          </Link>
          <Link href="/blog" className="text-text transition-colors hover:text-heading">
            {t("blog")}
          </Link>
          <Link href="/help" className="text-text transition-colors hover:text-heading">
            {t("help")}
          </Link>
          <Link href="/templates" className="text-text transition-colors hover:text-heading">
            {t("templates")}
          </Link>
          <Link href="/pricing" className="text-text transition-colors hover:text-heading">
            {t("pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link href="/login" className="hidden text-sm text-text hover:text-heading sm:block">
            {t("login")}
          </Link>
          <Link href="/login" className="btn-accent !px-4 !py-2 text-sm">
            {t("startTrial")}
          </Link>
        </div>
      </div>
    </header>
  );
}
