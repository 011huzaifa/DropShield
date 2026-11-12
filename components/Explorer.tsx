"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LISTINGS } from "@/data/listings";
import type { Listing } from "@/data/types";
import { LAST_CHECKED } from "@/data/site";
import { daysText, eff, grad, isHttps, msLeft, ORDER, PILL, shortDate, STATUS_LABEL, timing } from "@/lib/listing";
import { useApp, type StatusFilter } from "./AppProvider";
import { Icon, Mark } from "./Icon";

const CHIPS: [StatusFilter, string][] = [
  ["all", "All"], ["open", "Open now"], ["points", "Points only"], ["unconfirmed", "Unconfirmed"], ["ended", "Closed"], ["tracked", "My list"],
];
type Sort = "deadline" | "name" | "status";

export function Explorer() {
  const { now, tracked, filter, setFilter, toggleTrack } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("deadline");
  const [openId, setOpenId] = useState<string | null>(null);

  const count = (k: StatusFilter) =>
    k === "all" ? LISTINGS.length : k === "tracked" ? tracked.length : LISTINGS.filter((p) => eff(p, now) === k).length;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const l = LISTINGS.filter((p) => {
      if (filter === "tracked") { if (!tracked.includes(p.id)) return false; }
      else if (filter !== "all" && eff(p, now) !== filter) return false;
      return !needle || `${p.name} ${p.chain} ${p.reward} ${p.tag ?? ""}`.toLowerCase().includes(needle);
    });
    const soon = (p: Listing) => (eff(p, now) === "open" && p.deadline ? msLeft(p, now)! : 1e15);
    l.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return ORDER[eff(a, now)] - ORDER[eff(b, now)] || a.name.localeCompare(b.name);
      return soon(a) - soon(b) || ORDER[eff(a, now)] - ORDER[eff(b, now)] || a.name.localeCompare(b.name);
    });
    return l;
  }, [q, sort, filter, tracked, now]);

  const current = openId ? LISTINGS.find((p) => p.id === openId) : undefined;

  return (
    <>
      <div className="panel reveal">
        <div className="toolbar">
          <label className="search">
            <Icon id="i-search" style={{ fontSize: 18 }} />
            <span className="sr">Search airdrops</span>
            <input type="search" placeholder="Search by name, network or reward" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className="sel" aria-label="Sort airdrops" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="deadline">Sort: Ending soonest</option>
            <option value="name">Sort: Name A to Z</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
        <div className="chips" role="group" aria-label="Filter by status">
          {CHIPS.map(([k, label]) => (
            <button key={k} className="chip" type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {label} <i>{count(k)}</i>
            </button>
          ))}
        </div>
        <div className="grid" aria-live="polite">
          {list.length === 0 ? (
            <div className="empty">{filter === "tracked" ? "Your list is empty. Tap the bookmark on any card to track it." : "No campaigns match. Try another filter or search term."}</div>
          ) : (
            list.map((p, i) => {
              const on = tracked.includes(p.id), st = eff(p, now), dl = daysText(p, now);
              return (
                <article className="card" key={p.id} style={{ ["--i" as string]: i }} onClick={() => setOpenId(p.id)}>
                  <div className="card-top">
                    <Mark gradient={grad(p)} letter={p.name.charAt(0)} />
                    <div className="meta"><h3>{p.name}</h3><div className="sub">{p.reward}</div></div>
                    {st === "open" && dl ? <span className="dl" style={{ background: "var(--ink)" }}>{dl}</span> : null}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className={"pill " + PILL[st]}>{STATUS_LABEL[st]}</span>
                    {p.tag ? <span className="pill p-tag">{p.tag}</span> : null}
                  </div>
                  <p className="sum">{p.summary}</p>
                  <div className="facts">
                    <div className="fact"><span>Timing</span><b>{timing(p, now)}</b></div>
                    <div className="fact"><span>Network</span><b>{p.chain}</b></div>
                    <div className="fact" style={{ gridColumn: "1/-1" }}><span>Who qualifies</span><b>{p.who}</b></div>
                  </div>
                  <div className="card-foot">
                    <span className="tag">Checked {shortDate(p.checked ?? LAST_CHECKED)}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button className="tb" type="button" aria-pressed={on} aria-label={(on ? "Remove " : "Track ") + p.name}
                        onClick={(e) => { e.stopPropagation(); toggleTrack(p.id); }}>
                        <Icon id="i-bookmark" style={{ fontSize: 18, ...(on ? { fill: "currentColor" } : {}) }} />
                      </button>
                      <button className="btn btn-ink btn-sm" type="button" onClick={(e) => { e.stopPropagation(); setOpenId(p.id); }}>Details</button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
      {current ? <Modal p={current} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

function Modal({ p, onClose }: { p: Listing; onClose: () => void }) {
  const { now, tracked, done, toggleTrack, setTaskDone, toast } = useApp();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const st = eff(p, now), on = tracked.includes(p.id), doneList = done[p.id] ?? [];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const copy = async (v: string) => {
    try { await navigator.clipboard.writeText(v); toast("Address copied"); } catch { toast("Select the address and copy it"); }
  };

  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${p.name} details`}>
        <div className="mh">
          <Mark gradient={grad(p)} letter={p.name.charAt(0)} />
          <div className="meta">
            <h3>{p.name}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <span className={"pill " + PILL[st]}>{STATUS_LABEL[st]}</span>
              {p.tag ? <span className="pill p-tag">{p.tag}</span> : null}
              <span className="tag">Checked {shortDate(p.checked ?? LAST_CHECKED)}</span>
            </div>
          </div>
          <button className="x" ref={closeBtn} type="button" aria-label="Close" onClick={onClose}><Icon id="i-close" /></button>
        </div>
        <p className="about">{p.summary}</p>
        <div className="facts4">
          <div className="fact"><span>Timing</span><b>{timing(p, now)}</b></div>
          <div className="fact"><span>Closes</span><b>{p.closes}</b></div>
          <div className="fact"><span>Network</span><b>{p.chain}</b></div>
          <div className="fact"><span>Reward</span><b>{p.reward}</b></div>
          <div className="fact" style={{ gridColumn: "1/-1" }}><span>Who qualifies</span><b>{p.who}</b></div>
        </div>

        <h5>What to know</h5>
        <ul className="flags">
          {p.flags.map((f, i) => (
            <li key={i}><span className={"ic ic-" + f.l}>{f.l === "good" ? "✓" : f.l === "info" ? "i" : "!"}</span><span>{f.t}</span></li>
          ))}
        </ul>

        <h5>Your checklist</h5>
        <ul className="tasks">
          {p.tasks.map((t, i) => (
            <li key={i}><label><input type="checkbox" checked={doneList.includes(i)} onChange={(e) => setTaskDone(p.id, i, e.target.checked)} /><span>{t}</span></label></li>
          ))}
        </ul>

        <h5>Official page</h5>
        {p.official ? (
          <div className="official">
            <span>Type this address yourself or use your own bookmark. Do not open it from a message.</span>
            <div className="row"><code>{p.official}</code><button className="btn btn-ghost btn-sm" type="button" onClick={() => copy(p.official!)}>Copy</button></div>
          </div>
        ) : (
          <div className="official"><span>No single claim address applies. Open this from the project&apos;s official app or announcement, never from a link in a message.</span></div>
        )}
        {isHttps(p.referralUrl) ? (
          <div className="official" style={{ marginTop: 10 }}>
            <a className="btn btn-orange" href={p.referralUrl} target="_blank" rel="sponsored noopener noreferrer">Open official page <Icon id="i-up" className="i arr" /></a>
            <span>Referral link. DropShield may earn a reward if you sign up through it. It costs you nothing extra.</span>
          </div>
        ) : null}

        <h5>Sources</h5>
        <ul className="srcs">
          {p.sources.map((s) => (
            <li key={s.u}><a href={s.u} target="_blank" rel="noopener noreferrer"><span>{s.t}</span><Icon id="i-up" /></a></li>
          ))}
        </ul>

        <div className="macts">
          <button className="btn btn-ink" type="button" onClick={() => toggleTrack(p.id)}>{on ? "Remove from my list" : "Add to my list"}</button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Close</button>
        </div>
        <p className="disc">Compiled from public reporting and may be out of date. Confirm on the project&apos;s official channel. Not financial advice. Airdrops are never guaranteed.</p>
      </div>
    </div>
  );
}
