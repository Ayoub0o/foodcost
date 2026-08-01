import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe/billing-sessions";

/**
 * Create a Stripe Checkout Session for Pro (no Stripe trial — trial is app-side).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      interval?: "month" | "year";
      locale?: string;
      workspaceId?: string;
    };

    let workspaceId = body.workspaceId;
    if (!workspaceId) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("workspace_id,role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      workspaceId = membership?.workspace_id;
    }
    if (!workspaceId) return NextResponse.json({ error: "no workspace" }, { status: 400 });

    const result = await createCheckoutSession({
      workspaceId,
      interval: body.interval,
      locale: body.locale,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
