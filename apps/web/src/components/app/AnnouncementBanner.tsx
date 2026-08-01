"use client";

import { useState } from "react";

export function AnnouncementBanner({
  id,
  title,
  body,
  level,
}: {
  id: string;
  title: string;
  body: string;
  level: "info" | "warning";
}) {
  const key = `fc_announcement_dismiss_${id}`;
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(key) === "1";
  });

  if (hidden) return null;

  const tone =
    level === "warning"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
      : "border-border-accent bg-accent/10 text-heading";

  return (
    <div className={`border-b px-4 py-2 text-sm ${tone}`} data-testid="announcement-banner">
      <div className="container-bringer flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-0.5 opacity-90">{body}</p>
        </div>
        <button
          type="button"
          className="text-xs underline"
          onClick={() => {
            sessionStorage.setItem(key, "1");
            setHidden(true);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
