import type { Campaign, Status } from "./types";

export const STATUS: Record<Status, string> = { open: "Open now", points: "Points only", unconfirmed: "Unconfirmed", ended: "Closed" };
export const PILL: Record<Status, string> = { open: "p-confirmed", points: "p-points", unconfirmed: "p-unconf", ended: "p-ended" };
export const ORDER: Record<Status, number> = { open: 0, points: 1, unconfirmed: 2, ended: 3 };

export function ms(p: Campaign, now: number): number | null {
  return p.deadline ? new Date(p.deadline).getTime() - now : null;
}
/** Effective status: an "open" campaign past its deadline counts as closed. */
export function eff(p: Campaign, now: number): Status {
  const m = ms(p, now);
  return p.status === "open" && m !== null && m < 0 ? "ended" : p.status;
}
export function daysText(p: Campaign, now: number): string | null {
  const m = ms(p, now);
  if (m === null) return null;
  if (m < 0) return "Closed";
  const d = Math.ceil(m / 86400000);
  return d <= 1 ? "Under 1 day" : d + " days";
}
export function timing(p: Campaign, now: number): string {
  if (eff(p, now) === "ended") return p.status === "ended" ? "Closed" : "Closed " + p.closes;
  const d = daysText(p, now);
  return d ? d + " left" : p.closes;
}
export function hueOf(p: Campaign): [number, number] {
  if (p.hue) return p.hue;
  let h = 0;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return [h, (h + 40) % 360];
}
export function grad(p: Campaign): string {
  const [a, b] = hueOf(p);
  return `linear-gradient(135deg,hsl(${a} 88% 54%),hsl(${b} 78% 50%))`;
}
export function ringColor(n: number): string {
  return n >= 75 ? "#0c8f5a" : n >= 50 ? "#e0a000" : "#d92d47";
}
export function shortDate(s: string): string {
  return s.replace("November", "Nov");
}
export function hostOf(url: string): string {
  try { return new URL(url).host; } catch { return url; }
}
