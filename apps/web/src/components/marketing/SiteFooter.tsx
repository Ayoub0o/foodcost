import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

export async function SiteFooter() {
  const t = await getTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-mute py-12">
      <div className="container-bringer flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-heading">{siteConfig.name}</p>
          <p className="mt-1 text-xs text-text">
            © {year} PixPlat · {siteConfig.currency} ${(siteConfig.priceCents / 100).toFixed(0)}/mo
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-text">
          <Link href="/calculator" className="hover:text-heading">
            {t("calculator")}
          </Link>
          <Link href="/blog" className="hover:text-heading">
            {t("blog")}
          </Link>
          <Link href="/help" className="hover:text-heading">
            {t("help")}
          </Link>
          <Link href="/pricing" className="hover:text-heading">
            {t("pricing")}
          </Link>
          <Link href="/privacy" className="hover:text-heading">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-heading">
            {t("terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
