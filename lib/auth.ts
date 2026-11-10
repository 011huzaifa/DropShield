import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "ds_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 8) return null;
  return (process.env.ADMIN_SECRET || p) + "|dropshield";
}
function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()!).update(payload).digest("hex");
}
function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export function adminConfigured(): boolean {
  return secret() !== null;
}
export function checkPassword(input: string): boolean {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 8) return false;
  const h = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
  return safeEqual(h(input), h(p));
}
export function makeToken(): string {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return exp + "." + sign(exp);
}
export function tokenValid(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return tokenValid(jar.get(COOKIE)?.value);
}
export const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
