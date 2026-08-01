"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/marketing/LocaleSwitcher";
import { HelpSlideOver } from "./HelpSlideOver";
import { signOut } from "@/app/[locale]/(auth)/login/actions";

type NavKey = "overview" | "ingredients" | "recipes" | "profitability" | "reports" | "settings";

const NAV: { key: NavKey; href: "/dashboard" | "/ingredients" | "/recipes" | "/profitability" | "/reports" | "/settings" }[] = [
  { key: "overview", href: "/dashboard" },
  { key: "ingredients", href: "/ingredients" },
  { key: "recipes", href: "/recipes" },
  { key: "profitability", href: "/profitability" },
  { key: "reports", href: "/reports" },
  { key: "settings", href: "/settings" },
];

export interface AppShellProps {
  locale: string;
  workspaceName: string;
  userEmail: string;
  trialDaysLeft: number | null;
  locked: boolean;
  plan: string;
  children: React.ReactNode;
}

export function AppShell({
  locale,
  workspaceName,
  userEmail,
  trialDaysLeft,
  locked,
  plan,
  children,
}: AppShellProps) {
  const t = useTranslations("App");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const currentPage = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.key;

  const trialPill = locked
    ? { label: t("trial.locked"), tone: "text-red-400 border-red-500/40" }
    : plan === "pro"
      ? { label: t("trial.pro"), tone: "text-accent-text border-border-accent" }
      : {
          label: t("trial.trialing", { days: trialDaysLeft ?? 0 }),
          tone: "text-accent-text border-border-accent",
        };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = currentPage === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`rounded-xs px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-accent/15 font-semibold text-heading"
                : "text-text hover:bg-container hover:text-heading"
            }`}
          >
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xs focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-heading"
      >
        Skip to main content
      </a>
      {/* Sidebar (desktop) */}
      <aside
        className="hidden border-r border-border-mute bg-nav md:flex md:flex-col md:justify-between md:p-5"
        aria-label="Workspace navigation"
      >
        <div>
          <Link href="/dashboard" className="block text-base font-semibold tracking-[-0.03em] text-heading">
            FoodCost
          </Link>
          <p className="mt-1 truncate text-xs text-text">{workspaceName}</p>
          <div className={`mt-4 inline-block rounded-xs border px-2.5 py-1 text-xs font-medium ${trialPill.tone}`}>
            {trialPill.label}
          </div>
          <div className="mt-6">{nav}</div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="w-full rounded-xs border border-border px-3 py-2 text-left text-sm text-text transition-colors hover:border-border-accent hover:text-heading"
          >
            {t("help.button")}
          </button>
          <LocaleSwitcher />
          <div className="border-t border-border-mute pt-3">
            <p className="truncate text-xs text-text">{userEmail}</p>
            <form action={signOut} className="mt-2">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="text-xs text-text underline hover:text-heading">
                {t("common.signOut")}
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border-mute bg-nav px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-xs border border-border px-3 py-2 text-sm text-heading"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          ☰
        </button>
        <span className="text-sm font-semibold text-heading">FoodCost</span>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="text-sm text-text"
        >
          {t("help.button")}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-b border-border-mute bg-nav p-4 md:hidden">
          <div className={`mb-4 inline-block rounded-xs border px-2.5 py-1 text-xs font-medium ${trialPill.tone}`}>
            {trialPill.label}
          </div>
          {nav}
          <div className="mt-4 border-t border-border-mute pt-3">
            <LocaleSwitcher />
            <form action={signOut} className="mt-3">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="text-xs text-text underline hover:text-heading">
                {t("common.signOut")}
              </button>
            </form>
          </div>
        </div>
      )}

      <main id="main-content" className="min-w-0 bg-body" tabIndex={-1}>
        {children}
      </main>

      <HelpSlideOver
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        page={currentPage ?? "overview"}
      />
    </div>
  );
}
