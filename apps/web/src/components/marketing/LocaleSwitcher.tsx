"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";

/** Switches locale while preserving the current (localized) pathname. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  // usePathname may resolve to a dynamic template (e.g. "/recipes/[id]"); at
  // runtime it is a concrete path, so switch locale via a plain string href.
  const replace = router.replace as (href: string, options: { locale: string }) => void;

  return (
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em]">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={
            l === locale
              ? "rounded-xs px-2 py-1 text-heading"
              : "rounded-xs px-2 py-1 text-text transition-colors hover:text-heading"
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
