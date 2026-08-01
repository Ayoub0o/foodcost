"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function BillingCard({
  locale,
  plan,
  trialDaysLeft,
  locked,
  hasCustomer,
  pastDue,
  yearlyAvailable,
}: {
  locale: string;
  plan: string;
  trialDaysLeft: number | null;
  locked: boolean;
  hasCustomer: boolean;
  pastDue?: boolean;
  yearlyAvailable?: boolean;
}) {
  const t = useTranslations("App.settings");
  const intlLocale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function go(path: "/api/stripe/checkout" | "/api/stripe/portal", body: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/foodcost${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "billing error");
        window.location.href = data.url;
      } catch (e) {
        setError(e instanceof Error ? e.message : t("billingError"));
      }
    });
  }

  const showSubscribe = locked || plan === "trialing";

  return (
    <div
      id="billing"
      className="mt-10 max-w-lg rounded-lg border border-border bg-container p-6"
      data-testid="billing-card"
    >
      <h2 className="text-lg font-semibold text-heading">{t("billingTitle")}</h2>
      <p className="mt-2 text-sm text-text">
        {pastDue
          ? t("billingPastDue")
          : locked
            ? t("billingLocked")
            : plan === "pro"
              ? t("billingPro")
              : t("billingTrial", { days: trialDaysLeft ?? 0 })}
      </p>

      {showSubscribe && (
        <p className="mt-4 text-xs text-text" data-testid="billing-legal-consent">
          {intlLocale === "fr" ? (
            <>
              En vous abonnant, vous acceptez nos{" "}
              <Link href="/terms" className="text-accent-text underline">
                Conditions d&apos;utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy" className="text-accent-text underline">
                Politique de confidentialité
              </Link>
              .
            </>
          ) : (
            <>
              By subscribing you accept our{" "}
              <Link href="/terms" className="text-accent-text underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-accent-text underline">
                Privacy Policy
              </Link>
              .
            </>
          )}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {showSubscribe && (
          <>
            <button
              type="button"
              disabled={isPending}
              data-testid="billing-checkout-month"
              onClick={() => go("/api/stripe/checkout", { interval: "month", locale })}
              className="btn-accent !px-4 !py-2 text-sm"
            >
              {t("subscribeMonthly")}
            </button>
            {yearlyAvailable && (
              <button
                type="button"
                disabled={isPending}
                data-testid="billing-checkout-year"
                onClick={() => go("/api/stripe/checkout", { interval: "year", locale })}
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                {t("subscribeYearly")}
              </button>
            )}
          </>
        )}
        {hasCustomer && (
          <button
            type="button"
            disabled={isPending}
            data-testid="billing-portal"
            onClick={() => go("/api/stripe/portal", { locale })}
            className="btn-ghost !px-4 !py-2 text-sm"
          >
            {t("manageBilling")}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-amber-400">
          {error.includes("STRIPE_") ? t("billingNotConfigured") : error}
        </p>
      )}
    </div>
  );
}
