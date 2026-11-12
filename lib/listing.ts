import type { Listing, Status } from "@/data/types";

export const STATUS_LABEL: Record<Status, string> = { open: "Open now", points: "Points only", unconfirmed: "Unconfirmed", ended: "Closed" };
export const PILL: Record<Status, string> = { open: "p-confirmed", points: "p-points", unconfirmed: "p-unconf", ended: "p-ended" };
export const ORDER: Record<Status, number> = { open: 0, points: 1, unconfirmed: 2, ended: 3 };

const DAY = 86400000;

export function msLeft(p: Listing, now: number): number | null {
  return p.deadline ? new Date(p.deadline).getTime() - now : null;
}

/** Effective status: an "open" listing whose deadline has passed counts as closed. */
export function eff(p: Listing, now: number): Status {
  const m = msLeft(p, now);
  return p.status === "open" && m !== null && m < 0 ? "ended" : p.status;
}

export function daysText(p: Listing, now: number): string | null {
  const m = msLeft(p, now);
  if (m === null) return null;
  if (m < 0) return "Closed";
  const d = Math.ceil(m / DAY);
  return d <= 1 ? "Under 1 day" : `${d} days`;
}

export function timing(p: Listing, now: number): string {
  if (eff(p, now) === "ended") return p.status === "ended" ? "Closed" : `Closed ${p.closes}`;
  const d = daysText(p, now);
  return d ? `${d} left` : p.closes;
}

export function grad(p: Listing): string {
  return `linear-gradient(135deg,hsl(${p.hue[0]} 88% 54%),hsl(${p.hue[1]} 78% 50%))`;
}

export function shortDate(s: string): string {
  return s.replace("November", "Nov").replace("December", "Dec");
}

export function isHttps(u?: string | null): u is string {
  return !!u && /^https:\/\//i.test(u);
}
