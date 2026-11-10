import type { Campaign, FlagLevel, Status } from "./types";
import { BLOCKED_CATEGORIES, ALLOWED_CATEGORIES, findBlockedWord } from "./policy";

const STATUSES: Status[] = ["open", "points", "unconfirmed", "ended"];
const LEVELS: FlagLevel[] = ["good", "warn", "info"];

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function httpsUrl(v: unknown): string | null {
  const s = str(v, 2000);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Validates one campaign from the admin form. Returns the clean campaign or an error text. */
export function cleanCampaign(raw: any): { ok: true; value: Campaign } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid campaign" };
  const id = str(raw.id, 60).toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return { ok: false, error: `Invalid id "${id}". Use lowercase letters, numbers and dashes.` };
  const name = str(raw.name, 80);
  if (!name) return { ok: false, error: `${id}: name is required` };
  if (!STATUSES.includes(raw.status)) return { ok: false, error: `${name}: invalid status` };

  const category = str(raw.category, 40);
  if (category in BLOCKED_CATEGORIES) return { ok: false, error: `${name}: category "${BLOCKED_CATEGORIES[category]}" is not allowed on this site.` };
  if (!(category in ALLOWED_CATEGORIES)) return { ok: false, error: `${name}: pick a valid category` };

  let deadline: string | null = null;
  if (raw.deadline) {
    const d = new Date(String(raw.deadline));
    if (isNaN(d.getTime())) return { ok: false, error: `${name}: deadline is not a valid date` };
    deadline = d.toISOString();
  }

  const refRaw = str(raw.referralUrl, 2000);
  const referralUrl = httpsUrl(refRaw);
  if (refRaw && !referralUrl) return { ok: false, error: `${name}: referral link must be a full https:// link` };

  const sources: Campaign["sources"] = [];
  for (const s of Array.isArray(raw.sources) ? raw.sources : []) {
    const t = str(s?.t, 140), u = httpsUrl(s?.u);
    if (!t && !s?.u) continue;
    if (!t || !u) return { ok: false, error: `${name}: each source needs a title and a full https:// link` };
    sources.push({ t, u });
  }
  const flags: Campaign["flags"] = [];
  for (const f of Array.isArray(raw.flags) ? raw.flags : []) {
    const t = str(f?.t, 300);
    if (!t) continue;
    flags.push({ l: LEVELS.includes(f?.l) ? f.l : "warn", t });
  }
  const tasks = (Array.isArray(raw.tasks) ? raw.tasks : []).map((t: unknown) => str(t, 300)).filter(Boolean);

  let hue: [number, number] | undefined;
  if (Array.isArray(raw.hue) && raw.hue.length === 2) {
    const a = Number(raw.hue[0]), b = Number(raw.hue[1]);
    if (isFinite(a) && isFinite(b)) hue = [Math.max(0, Math.min(360, a)), Math.max(0, Math.min(360, b))];
  }

  const value: Campaign = {
    id, name, status: raw.status, category,
    chain: str(raw.chain, 80) || "Not stated in sources",
    reward: str(raw.reward, 120) || "Not announced",
    who: str(raw.who, 200) || "Not announced",
    deadline,
    closes: str(raw.closes, 120) || "No dates published",
    ...(hue ? { hue } : {}),
    official: str(raw.official, 200) || null,
    referralUrl,
    summary: str(raw.summary, 600),
    flags, tasks, sources,
    visible: raw.visible === false ? false : true,
  };
  const bad = findBlockedWord(value);
  if (bad) return { ok: false, error: `${name}: contains the word "${bad}", which is blocked by the content policy. Remove it or reword.` };
  return { ok: true, value };
}

export function cleanList(raw: unknown): { ok: true; value: Campaign[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: "Expected a list" };
  if (raw.length > 300) return { ok: false, error: "Too many campaigns" };
  const out: Campaign[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const c = cleanCampaign(r);
    if (!c.ok) return c;
    if (seen.has(c.value.id)) return { ok: false, error: `Duplicate id "${c.value.id}"` };
    seen.add(c.value.id);
    out.push(c.value);
  }
  return { ok: true, value: out };
}
