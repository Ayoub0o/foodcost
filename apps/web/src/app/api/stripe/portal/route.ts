import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe/billing-sessions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      locale?: string;
      workspaceId?: string;
    };

    let workspaceId = body.workspaceId;
    if (!workspaceId) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("workspace_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      workspaceId = membership?.workspace_id;
    }
    if (!workspaceId) return NextResponse.json({ error: "no workspace" }, { status: 400 });

    const result = await createPortalSession({
      workspaceId,
      locale: body.locale,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
