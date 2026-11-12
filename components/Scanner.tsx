"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const BAD_TLD = ["xyz", "top", "click", "live", "site", "online", "icu", "cc", "monster", "lol", "buzz", "rest", "cfd", "sbs"];
const BAIT = ["claim", "free", "airdrop", "reward", "bonus", "giveaway", "gift", "mint-now", "eligible", "voucher"];
const PATH_BAIT = ["connect-wallet", "validate", "verify-wallet", "recover", "restore", "sync-wallet", "rectify", "dapp-connect"];

type Result = { cls: "good" | "warn" | "bad"; title: string; host?: string; flags: string[]; score?: number };

const color = (n: number) => (n >= 75 ? "#0c8f5a" : n >= 50 ? "#e0a000" : "#d92d47");

function Ring({ score, size = 60, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, cl = color(score);
  return (
    <>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="trk" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cl} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <span className="num" style={{ fontSize: Math.round(size * 0.34), color: cl }}>{score}</span>
    </>
  );
}

function analyse(raw: string): Result {
  let u: URL;
  try { u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : "https://" + raw); }
  catch { return { cls: "warn", title: "Could not read that link", flags: ["Paste the full address, for example https://example.com/page."] }; }
  const host = u.hostname.toLowerCase(), flags: string[] = [];
  let pts = 0;
  const add = (p: number, t: string) => { pts += p; flags.push(t); };
  if (u.protocol !== "https:") add(25, "Not using HTTPS, so the connection is not encrypted.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add(40, "The address is a raw IP number, not a normal domain.");
  if (host.includes("xn--")) add(40, "Uses punycode, which can disguise lookalike letters.");
  if (u.username || u.password || raw.includes("@")) add(35, "Contains an @ sign, which can hide the real destination.");
  const parts = host.split("."), tld = parts[parts.length - 1];
  if (BAD_TLD.includes(tld)) add(15, `Ends in .${tld}, a domain type often used by throwaway scam sites.`);
  if (parts.length > 4) add(15, "Has many subdomains, a common way to imitate a real brand.");
  if ((host.match(/-/g) || []).length >= 2) add(15, "Several hyphens in the domain name, typical of fake lookalikes.");
  const hit = BAIT.filter((w) => host.includes(w));
  if (hit.length) add(25, `The domain contains bait words (${hit.join(", ")}). Real projects rarely put these in the domain.`);
  const path = (u.pathname + u.search).toLowerCase();
  const ph = PATH_BAIT.filter((w) => path.includes(w));
  if (ph.length) add(20, `The path asks you to connect, verify or restore a wallet (${ph.join(", ")}).`);
  if (host.length > 40) add(10, "Very long domain name.");
  const risk = Math.min(100, pts);
  const cls = risk >= 50 ? "bad" : risk >= 20 ? "warn" : "good";
  const title = cls === "bad" ? "High risk. Do not connect a wallet." : cls === "warn" ? "Be careful with this link." : "No obvious red flags in the address.";
  return { cls, title, host, flags: flags.length ? flags : ["The address shows none of the patterns we check for. That does not guarantee the page is safe."], score: 100 - risk };
}

export function Scanner() {
  const [value, setValue] = useState("");
  const [out, setOut] = useState<ReactNode>(<div className="hint">Results appear here. Paste a link or use an example.</div>);

  const run = (raw: string) => {
    raw = raw.trim();
    if (!raw) { setOut(<div className="hint">Paste a link first, or use an example.</div>); return; }
    if (!/[/.:]/.test(raw) && raw.split(/\s+/).length >= 6) {
      setValue("");
      setOut(
        <div className="verdict v-bad"><div><b>That looks like a seed phrase, not a link</b>
          <ul className="rf"><li>We cleared it from the box. Never paste a seed phrase into any website.</li><li>If you typed it anywhere else, move your funds to a new wallet.</li></ul></div></div>,
      );
      return;
    }
    const r = analyse(raw);
    setOut(
      <>
        <div className={"verdict v-" + r.cls}>
          {r.score !== undefined ? <div className="ring"><Ring score={r.score} /></div> : null}
          <div style={{ minWidth: 0 }}>
            <b>{r.title}</b>
            {r.host ? <div className="mono small" style={{ overflowWrap: "anywhere", marginTop: 2 }}>{r.host}</div> : null}
            <ul className="rf">{r.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        </div>
        <p className="disc">This checks the address pattern only. A clean result is not a guarantee.</p>
      </>,
    );
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); run(value); };
  const example = (v: string) => { setValue(v); run(v); };

  return (
    <>
      <form className="field" autoComplete="off" onSubmit={onSubmit}>
        <input type="text" placeholder="https://…" aria-label="Link to scan" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn btn-ink" type="submit">Scan link</button>
      </form>
      <div className="try">
        Try an example:{" "}
        <button type="button" onClick={() => example("https://free-eth-claim-now.xyz/connect-wallet")}>risky link</button>
        <button type="button" onClick={() => example("https://docs.example.org/guide")}>normal link</button>
      </div>
      <div className="result" aria-live="polite">{out}</div>
    </>
  );
}
