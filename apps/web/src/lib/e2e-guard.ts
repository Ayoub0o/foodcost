import { NextResponse } from "next/server";
import { e2eRoutesEnabled } from "@/lib/env";

/** Returns a 404 response when E2E helper routes are disabled in this deploy. */
export function e2eDisabledResponse(): NextResponse | null {
  if (e2eRoutesEnabled()) return null;
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
