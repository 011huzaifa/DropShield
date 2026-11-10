"use client";
import { useEffect, useRef } from "react";
import type { Campaign } from "@/lib/types";
import { PILL, STATUS, daysText, eff, grad, hostOf, shortDate, timing } from "@/lib/util";
import { Ico } from "./ui";

type Props = {
  p: Campaign; now: number; lastChecked: string; tracked: boolean; done: number[];
  onClose: () => void; onToggleTrack: () => void; onToggleTask: (i: number, checked: boolean) => void; toast: (m: string) => void;
};

export default function CampaignModal({ p, now, lastChecked, tracked, done, onClose, onToggleTrack, onToggleTask, toast }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const st = eff(p, now);
  useEffect(() => { closeRef.current?.focus(); }, []);

  function copy(v: string) {
    try { navigator.clipboard.writeText(v).then(() => toast("Address copied"), () => toast("Select the address and copy it")); }
    catch { toast("Select the address and copy it"); }
  }

  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name + " details"}>
        <div className="mh">
          <div className="mk" style={{ background: grad(p) }}>{p.name.charAt(0)}</div>
          <div className="meta">
            <h3>{p.name}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <span className={"pill " + PILL[st]}>{STATUS[st]}</span>
              <span className="tag">Checked {shortDate(lastChecked)}</span>
            </div>
          </div>
          <button className="x" ref={closeRef} type="button" aria-label="Close" onClick={onClose}><Ico id="i-close" /></button>
        </div>
        <p className="about">{p.summary}</p>
        <div className="facts4">
          <div className="fact"><span>Timing</span><b>{timing(p, now)}</b></div>
          <div className="fact"><span>Closes</span><b>{p.closes}</b></div>
          <div className="fact"><span>Network</span><b>{p.chain}</b></div>
          <div className="fact"><span>Reward</span><b>{p.reward}</b></div>
          <div className="fact" style={{ gridColumn: "1/-1" }}><span>Who qualifies</span><b>{p.who}</b></div>
        </div>

        {p.flags.length > 0 && (<>
          <h5>What to know</h5>
          <ul className="flags">{p.flags.map((f, i) => (
            <li key={i}><span className={"ic ic-" + f.l}>{f.l === "good" ? "✓" : f.l === "info" ? "i" : "!"}</span><span>{f.t}</span></li>
          ))}</ul>
        </>)}

        {p.tasks.length > 0 && (<>
          <h5>Your checklist</h5>
          <ul className="tasks">{p.tasks.map((t, i) => (
            <li key={i}><label><input type="checkbox" checked={done.indexOf(i) >= 0} onChange={(e) => onToggleTask(i, e.target.checked)} /><span>{t}</span></label></li>
          ))}</ul>
        </>)}

        <h5>Official page</h5>
        {p.official ? (
          <div className="official">
            <span>Type this address yourself or use your own bookmark. Do not open it from a message.</span>
            <div className="row"><code>{p.official}</code><button className="btn btn-ghost btn-sm" type="button" onClick={() => copy(p.official!)}>Copy</button></div>
          </div>
        ) : (
          <div className="official"><span>No single claim address applies. Open this from the project&apos;s official app or announcement, never from a link in a message.</span></div>
        )}

        {p.referralUrl && (<>
          <h5>Referral link</h5>
          <div className="official">
            <span>This is a referral link. DropShield may earn a reward if you sign up through it. It does not change what you receive. Check the address before you open it.</span>
            <div className="row">
              <code>{hostOf(p.referralUrl)}</code>
              <a className="btn btn-orange btn-sm" href={p.referralUrl} target="_blank" rel="sponsored noopener noreferrer">Open referral link <Ico id="i-up" /></a>
            </div>
          </div>
        </>)}

        {p.sources.length > 0 && (<>
          <h5>Sources</h5>
          <ul className="srcs">{p.sources.map((s) => (
            <li key={s.u}><a href={s.u} target="_blank" rel="noopener noreferrer"><span>{s.t}</span><Ico id="i-up" /></a></li>
          ))}</ul>
        </>)}

        <div className="macts">
          <button className="btn btn-ink" type="button" onClick={onToggleTrack}>{tracked ? "Remove from my list" : "Add to my list"}</button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Close</button>
        </div>
        <p className="disc">Compiled from public reporting and may be out of date. Confirm on the project&apos;s official channel. Not financial advice. Airdrops are never guaranteed.</p>
      </div>
    </div>
  );
}
