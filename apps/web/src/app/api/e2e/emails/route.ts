import { NextResponse, type NextRequest } from "next/server";
import { clearStubEmails, getStubEmails } from "@/lib/email";

/** E2E helper: inspect in-memory stub emails (when RESEND_API_KEY is unset). */
export async function GET(request: NextRequest) {
  const secret = process.env.E2E_SETUP_SECRET;
  const provided =
    request.headers.get("x-e2e-secret") ?? request.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (request.nextUrl.searchParams.get("clear") === "1") {
    clearStubEmails();
  }
  return NextResponse.json({ emails: getStubEmails(50) });
}
