"use client";

import { useEffect } from "react";

export function Toast({
  message,
  onDismiss,
  testId = "toast",
}: {
  message: string;
  onDismiss: () => void;
  testId?: string;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      role="status"
      data-testid={testId}
      className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-lg border border-border-accent bg-container px-4 py-3 text-sm text-heading shadow-lg"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs text-accent-text hover:underline"
      >
        ×
      </button>
    </div>
  );
}
