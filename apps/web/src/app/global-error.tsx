"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#07090D] px-6 py-16 text-[#F5F7FA]">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-[#C5C7CE]">
          The error was logged. You can try again or return to the dashboard.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-[#3F6EE9] px-4 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
