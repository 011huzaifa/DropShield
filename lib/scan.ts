const BAD_TLD = ["xyz", "top", "click", "live", "site", "online", "icu", "cc", "monster", "lol", "buzz", "rest", "cfd", "sbs"];
const BAIT = ["claim", "free", "airdrop", "reward", "bonus", "giveaway", "gift", "mint-now", "eligible", "voucher"];
const PATH_BAIT = ["connect-wallet", "validate", "verify-wallet", "recover", "restore", "sync-wallet", "rectify", "dapp-connect"];

export type ScanResult =
  | { kind: "empty" }
  | { kind: "seed" }
  | { kind: "unreadable" }
  | { kind: "ok"; host: string; risk: number; cls: "good" | "warn" | "bad"; title: string; flags: string[] };

export function scanLink(rawIn: string): ScanResult {
  const raw = rawIn.trim();
  if (!raw) return { kind: "empty" };
  if (!/[\/.:]/.test(raw) && raw.split(/\s+/).length >= 6) return { kind: "seed" };
  let u: URL;
  try { u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : "https://" + raw); } catch { return { kind: "unreadable" }; }
  const host = u.hostname.toLowerCase();
  const flags: string[] = [];
  let pts = 0;
  const add = (p: number, t: string) => { pts += p; flags.push(t); };
  if (u.protocol !== "https:") add(25, "Not using HTTPS, so the connection is not encrypted.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add(40, "The address is a raw IP number, not a normal domain.");
  if (host.indexOf("xn--") >= 0) add(40, "Uses punycode, which can disguise lookalike letters.");
  if (u.username || u.password || raw.indexOf("@") >= 0) add(35, "Contains an @ sign, which can hide the real destination.");
  const parts = host.split("."), tld = parts[parts.length - 1];
  if (BAD_TLD.indexOf(tld) >= 0) add(15, "Ends in ." + tld + ", a domain type often used by throwaway scam sites.");
  if (parts.length > 4) add(15, "Has many subdomains, a common way to imitate a real brand.");
  if ((host.match(/-/g) || []).length >= 2) add(15, "Several hyphens in the domain name, typical of fake lookalikes.");
  const hit = BAIT.filter((w) => host.indexOf(w) >= 0);
  if (hit.length) add(25, "The domain contains bait words (" + hit.join(", ") + "). Real projects rarely put these in the domain.");
  const path = (u.pathname + u.search).toLowerCase();
  const ph = PATH_BAIT.filter((w) => path.indexOf(w) >= 0);
  if (ph.length) add(20, "The path asks you to connect, verify or restore a wallet (" + ph.join(", ") + ").");
  if (host.length > 40) add(10, "Very long domain name.");
  const risk = Math.min(100, pts);
  const cls = risk >= 50 ? "bad" : risk >= 20 ? "warn" : "good";
  const title = cls === "bad" ? "High risk. Do not connect a wallet." : cls === "warn" ? "Be careful with this link." : "No obvious red flags in the address.";
  return { kind: "ok", host, risk, cls, title, flags };
}
