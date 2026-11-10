"use client";
import { useEffect, useState } from "react";
import type { Campaign, FlagLevel, Status } from "@/lib/types";
import { grad } from "@/lib/util";

const BLANK = (): Campaign => ({
  id: "", name: "", status: "unconfirmed", category: "other", chain: "", reward: "", who: "", deadline: null, closes: "",
  official: null, referralUrl: null, summary: "", flags: [], tasks: [], sources: [], visible: true,
});
const STATUSES: [Status, string][] = [["open", "Open now"], ["points", "Points only"], ["unconfirmed", "Unconfirmed"], ["ended", "Closed"]];
const LEVELS: [FlagLevel, string][] = [["warn", "Warning"], ["good", "Good"], ["info", "Info"]];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function toLocal(iso: string | null) { return iso ? iso.slice(0, 16) : ""; }
function fromLocal(v: string) { return v ? new Date(v + ":00Z").toISOString() : null; }
function autoCloses(iso: string) {
  const d = new Date(iso);
  const m = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const hh = String(d.getUTCHours()).padStart(2, "0"), mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

export default function Admin({ categories }: { categories: Record<string, string> }) {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [pw, setPw] = useState("");
  const [list, setList] = useState<Campaign[]>([]);
  const [sel, setSel] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err" | "info"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [gh, setGh] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/campaigns", { cache: "no-store" });
    if (r.status === 401) { setAuth("out"); return; }
    const j = await r.json();
    setList(j.campaigns); setGh(!!j.githubConnected); setAuth("in"); setDirty(false);
  }
  useEffect(() => { load(); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (!r.ok) { setMsg({ t: "err", m: (await r.json().catch(() => ({}))).error || "Login failed" }); return; }
    setPw(""); load();
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAuth("out"); }

  async function save() {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/campaigns", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaigns: list }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ t: "err", m: j.error || "Save failed" }); return; }
    setList(j.campaigns); setDirty(false); setMsg({ t: "ok", m: j.note });
  }

  const cur = list[sel];
  function patch(p: Partial<Campaign>) { setList((l) => l.map((c, i) => (i === sel ? { ...c, ...p } : c))); setDirty(true); }
  function add() { setList((l) => [BLANK(), ...l]); setSel(0); setDirty(true); }
  function dup() { if (!cur) return; setList((l) => [{ ...cur, id: cur.id + "-copy", name: cur.name + " (copy)" }, ...l]); setSel(0); setDirty(true); }
  function del() {
    if (!cur || !confirm(`Delete "${cur.name || "this campaign"}"? This cannot be undone after saving.`)) return;
    setList((l) => l.filter((_, i) => i !== sel)); setSel(0); setDirty(true);
  }

  if (auth === "checking") return <div className="adm"><p>Loading…</p></div>;
  if (auth === "out") return (
    <form className="adm adm-login" onSubmit={login}>
      <h1 className="h3" style={{ fontSize: 28 }}>DropShield admin</h1>
      {msg && <div className={"adm-msg " + msg.t}>{msg.m}</div>}
      <label className="adm-f"><span>Password</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" /></label>
      <button className="btn btn-ink" type="submit" disabled={busy || !pw}>{busy ? "Checking…" : "Log in"}</button>
    </form>
  );

  return (
    <div className="adm">
      <div className="adm-top">
        <h1>Airdrop listings</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-ghost btn-sm" href="/" target="_blank">View site</a>
          <button className="btn btn-ghost btn-sm" onClick={logout} type="button">Log out</button>
          <button className="btn btn-orange btn-sm" onClick={save} disabled={busy || !dirty} type="button">{busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</button>
        </div>
      </div>
      {msg && <div className={"adm-msg " + msg.t} style={{ marginBottom: 14 }}>{msg.m}</div>}
      {!gh && <div className="adm-msg info" style={{ marginBottom: 14 }}>GitHub saving is not connected. On your own computer, changes are written to data/campaigns.json. For the live site, add GITHUB_TOKEN and GITHUB_REPO (see README).</div>}

      <div className="adm-grid">
        <div className="adm-list">
          <button className="btn btn-ink btn-sm" type="button" onClick={add}>+ New campaign</button>
          {list.map((c, i) => (
            <button key={i} type="button" className={"adm-item" + (i === sel ? " on" : "") + (c.visible === false ? " off" : "")} onClick={() => setSel(i)}>
              <span className="mk" style={{ background: grad(c) }}>{(c.name || "?").charAt(0)}</span>
              <span><b>{c.name || "Untitled"}</b><small>{c.status}{c.visible === false ? " · hidden" : ""}{c.referralUrl ? " · referral" : ""}</small></span>
            </button>
          ))}
        </div>

        {cur ? (
          <div className="adm-form">
            <div className="adm-row">
              <label className="adm-f"><span>Name</span>
                <input type="text" value={cur.name} onChange={(e) => patch({ name: e.target.value, ...(cur.id === "" || cur.id === slug(cur.name) ? { id: slug(e.target.value) } : {}) })} /></label>
              <label className="adm-f"><span>ID (used internally)</span><input type="text" value={cur.id} onChange={(e) => patch({ id: slug(e.target.value) })} /></label>
            </div>
            <div className="adm-row">
              <label className="adm-f"><span>Status</span>
                <select value={cur.status} onChange={(e) => patch({ status: e.target.value as Status })}>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
              <label className="adm-f"><span>Category</span>
                <select value={cur.category} onChange={(e) => patch({ category: e.target.value })}>
                  {!(cur.category in categories) && <option value={cur.category}>{cur.category} (not allowed)</option>}
                  {Object.entries(categories).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <small>Prediction markets, gambling, interest/lending, leveraged trading and adult content are blocked.</small></label>
            </div>
            <label className="adm-f"><span>Summary</span><textarea value={cur.summary} onChange={(e) => patch({ summary: e.target.value })} /></label>
            <div className="adm-row">
              <label className="adm-f"><span>Reward</span><input type="text" value={cur.reward} onChange={(e) => patch({ reward: e.target.value })} /></label>
              <label className="adm-f"><span>Network / chain</span><input type="text" value={cur.chain} onChange={(e) => patch({ chain: e.target.value })} /></label>
            </div>
            <label className="adm-f"><span>Who qualifies</span><input type="text" value={cur.who} onChange={(e) => patch({ who: e.target.value })} /></label>
            <div className="adm-row">
              <label className="adm-f"><span>Deadline (UTC, optional)</span>
                <input type="datetime-local" value={toLocal(cur.deadline)} onChange={(e) => { const iso = fromLocal(e.target.value); patch({ deadline: iso, ...(iso ? { closes: autoCloses(iso) } : {}) }); }} />
                <small>Leave empty if there is no fixed date. Sets the countdown and closes the card automatically.</small></label>
              <label className="adm-f"><span>Closes (text shown on card)</span><input type="text" value={cur.closes} onChange={(e) => patch({ closes: e.target.value })} /></label>
            </div>

            <h3 className="adm-h">Links</h3>
            <label className="adm-f"><span>Referral / airdrop link (https://…)</span>
              <input type="url" placeholder="https://project.xyz/?ref=yourcode" value={cur.referralUrl || ""} onChange={(e) => patch({ referralUrl: e.target.value || null })} />
              <small>Shows an &quot;Open referral link&quot; button with a disclosure. Leave empty for none.</small></label>
            <label className="adm-f"><span>Official address (shown as text, not clickable)</span>
              <input type="text" placeholder="project.xyz/airdrop" value={cur.official || ""} onChange={(e) => patch({ official: e.target.value || null })} /></label>

            <h3 className="adm-h">What to know (flags)</h3>
            {cur.flags.map((f, i) => (
              <div className="adm-sub" key={i}>
                <select style={{ maxWidth: 130 }} value={f.l} onChange={(e) => patch({ flags: cur.flags.map((x, j) => (j === i ? { ...x, l: e.target.value as FlagLevel } : x)) })}>{LEVELS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <input type="text" value={f.t} onChange={(e) => patch({ flags: cur.flags.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => patch({ flags: cur.flags.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            <div><button className="btn btn-ghost btn-sm" type="button" onClick={() => patch({ flags: [...cur.flags, { l: "warn", t: "" }] })}>+ Add flag</button></div>

            <label className="adm-f"><span>Checklist (one step per line)</span>
              <textarea value={cur.tasks.join("\n")} onChange={(e) => patch({ tasks: e.target.value.split("\n") })} /></label>

            <h3 className="adm-h">Sources</h3>
            {cur.sources.map((s, i) => (
              <div className="adm-sub" key={i}>
                <input type="text" placeholder="Title" value={s.t} onChange={(e) => patch({ sources: cur.sources.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
                <input type="url" placeholder="https://…" value={s.u} onChange={(e) => patch({ sources: cur.sources.map((x, j) => (j === i ? { ...x, u: e.target.value } : x)) })} />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => patch({ sources: cur.sources.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            <div><button className="btn btn-ghost btn-sm" type="button" onClick={() => patch({ sources: [...cur.sources, { t: "", u: "" }] })}>+ Add source</button></div>

            <div className="adm-row">
              <label className="adm-f"><span>Logo colour 1 (0 to 360)</span><input type="number" min={0} max={360} value={cur.hue?.[0] ?? ""} placeholder="auto" onChange={(e) => patch({ hue: e.target.value === "" ? undefined : [Number(e.target.value), cur.hue?.[1] ?? 200] })} /></label>
              <label className="adm-f"><span>Logo colour 2 (0 to 360)</span><input type="number" min={0} max={360} value={cur.hue?.[1] ?? ""} placeholder="auto" onChange={(e) => patch({ hue: e.target.value === "" ? undefined : [cur.hue?.[0] ?? 20, Number(e.target.value)] })} /></label>
            </div>
            <label className="adm-check"><input type="checkbox" checked={cur.visible !== false} onChange={(e) => patch({ visible: e.target.checked })} /> Show on the website (untick to hide without deleting)</label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={dup}>Duplicate</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={del} style={{ color: "var(--bad)", borderColor: "var(--bad)" }}>Delete</button>
            </div>
          </div>
        ) : <div className="adm-form"><p>No campaigns yet. Click “New campaign”.</p></div>}
      </div>
    </div>
  );
}
