import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, makeToken, COOKIE, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Set ADMIN_PASSWORD (8+ characters) in your environment variables first." }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body?.password ?? ""))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), cookieOptions);
  return res;
}
