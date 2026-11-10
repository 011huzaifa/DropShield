import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAllCampaigns } from "@/lib/campaigns";
import { cleanList } from "@/lib/validate";
import { saveCampaigns } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json({ campaigns: getAllCampaigns(), githubConnected: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const cleaned = cleanList(body?.campaigns);
  if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });
  try {
    const r = await saveCampaigns(cleaned.value);
    return NextResponse.json({ ok: true, ...r, campaigns: cleaned.value });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Save failed" }, { status: 500 });
  }
}
