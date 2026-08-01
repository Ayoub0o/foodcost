"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/marketing/LocaleSwitcher";
import { signOut } from "@/app/[locale]/(auth)/login/actions";

const NAV = [
  { key: "overview", href: "/admin" as const },
  { key: "customers", href: "/admin/customers" as const },
  { key: "support", href: "/admin/support" as const },
  { key: "content", href: "/admin/content" as const },
  { key: "announcements", href: "/admin/announcements" as const },
  { key: "audit", href: "/admin/audit" as const },
  { key: "ops", href: "/admin/ops" as const },
];

export function AdminShell({
  email,
  children,
}: {
  locale: string;
  email: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("Admin");
  const pathname = usePathname();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-container p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-text">
          {t("brand")}
        </p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-xs px-3 py-2 text-sm ${
                  active
                    ? "bg-accent/15 font-semibold text-heading"
                    : "text-text hover:bg-body hover:text-heading"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 space-y-3 border-t border-border pt-4">
          <Link href="/dashboard" className="block text-sm text-accent-text hover:underline">
            {t("backToApp")}
          </Link>
          <LocaleSwitcher />
          <p className="truncate text-xs text-text">{email}</p>
          <form action={signOut}>
            <button type="submit" className="text-xs text-text hover:text-heading">
              {t("signOut")}
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
