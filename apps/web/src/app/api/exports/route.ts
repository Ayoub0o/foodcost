import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateExportWorkbook } from "@/lib/exports/generate";
import type { ExportKind } from "@/lib/supabase/database.types";

const KINDS = new Set<ExportKind>(["recipe_book", "profitability", "catalog"]);

/**
 * Generate an xlsx export, log it, upload to Storage, return the file bytes
 * (and a download path for history).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { kind?: string; workspaceId?: string };
  const kindRaw = body.kind;
  if (!kindRaw || !KINDS.has(kindRaw as ExportKind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }
  const kind = kindRaw as Exclude<ExportKind, "tech_sheet_pdf">;

  const { data: memberships } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);
  const workspaceId = body.workspaceId ?? memberships?.[0]?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "no workspace" }, { status: 400 });
  }

  const { data: log, error: logError } = await supabase
    .from("exports_log")
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      kind,
      status: "processing",
    })
    .select("*")
    .single();

  if (logError || !log) {
    return NextResponse.json({ error: logError?.message ?? "log failed" }, { status: 500 });
  }

  try {
    const { buffer, filename } = await generateExportWorkbook(workspaceId, kind);
    const path = `${workspaceId}/${log.id}/${filename}`;

    const admin = createServiceRoleClient();
    const { error: uploadError } = await admin.storage.from("exports").upload(path, buffer, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

    await supabase
      .from("exports_log")
      .update({
        status: "ready",
        file_path: uploadError ? null : path,
      })
      .eq("id", log.id);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Export-Id": log.id,
        "X-Export-Path": uploadError ? "" : path,
      },
    });
  } catch (err) {
    await supabase.from("exports_log").update({ status: "failed" }).eq("id", log.id);
    const message = err instanceof Error ? err.message : "export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
