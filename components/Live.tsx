"use client";

import { LISTINGS } from "@/data/listings";
import { LAST_CHECKED } from "@/data/site";
import { daysText, eff, grad, msLeft, shortDate, STATUS_LABEL } from "@/lib/listing";
import { useApp } from "./AppProvider";
import { Icon } from "./Icon";
import { CountUp } from "./CountUp";

const DAY = 86400000;

export function HeroStage() {
  const { now } = useApp();
  const open = LISTINGS.filter((p) => eff(p, now) === "open" && p.deadline).sort((a, b) => msLeft(a, now)! - msLeft(b, now)!);
  const n0 = open[0];
  const d0 = n0 ? Math.max(1, Math.ceil(msLeft(n0, now)! / DAY)) : 0;

  return (
    <div className="stage ht" aria-label="Closing soon preview">
      <span className="stage-chip"><span className="live" /><span>Updated {shortDate(LAST_CHECKED)}</span></span>
      <div className="phone">
        <div className="ph-top"><b>Closing soon</b><span>Open now</span></div>
        <div className="nd">
          <small>Next deadline</small>
          {n0 ? (
            <>
              <b>{d0}</b>
              <span>{d0 === 1 ? "day" : "days"} · {n0.name}</span>
            </>
          ) : (
            <>
              <b>None</b>
              <span>No open claims right now</span>
            </>
          )}
        </div>
        <div className="ph-actions">
          <div><Icon id="i-shield" />Status</div>
          <div><Icon id="i-link" />Scan</div>
          <div><Icon id="i-bookmark" />Track</div>
          <div><Icon id="i-eye" />Sources</div>
        </div>
        <div className="ph-list">
          {open.slice(0, 3).map((p) => (
            <div className="ph-row" key={p.id}>
              <span className="m" style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 14, background: grad(p) }}>{p.name.charAt(0)}</span>
              <div className="grow"><b>{p.name}</b><small>{p.closes}</small></div>
              <span className="dl">{daysText(p, now)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="float">
        <div className="t"><b>Example scan</b><span className="pill p-flagged">3 red flags</span></div>
        <p className="mono">free-eth-claim-now.xyz</p>
        <p>New domain ending, bait words and a wallet-connect path. Do not connect.</p>
      </div>
    </div>
  );
}

export function Ticker() {
  const { now } = useApp();
  const render = (suffix: string) =>
    LISTINGS.map((p) => {
      const st = eff(p, now);
      return (
        <span className="tp" key={p.id + suffix}>
          <span className="m" style={{ background: grad(p) }}>{p.name.charAt(0)}</span>
          <b>{p.name}</b>
          <small>{STATUS_LABEL[st]}</small>
          {st === "open" && daysText(p, now) ? <span className="sc">{daysText(p, now)}</span> : null}
        </span>
      );
    });
  return (
    <div className="ticker" aria-label="Tracked campaigns">
      <div className="rail">
        {render("-a")}
        {render("-b")}
      </div>
    </div>
  );
}

export function Tiles() {
  const { now } = useApp();
  const total = LISTINGS.length;
  const open = LISTINGS.filter((p) => eff(p, now) === "open").length;
  const soon = LISTINGS.filter((p) => eff(p, now) === "open" && p.deadline && msLeft(p, now)! < 30 * DAY).length;
  return (
    <div className="tiles reveal">
      <div className="tile"><span>Campaigns tracked</span><CountUp value={total} /></div>
      <div className="tile indigo"><span>Open right now</span><CountUp value={open} /></div>
      <div className="tile"><span>Closing in 30 days</span><CountUp value={soon} /></div>
      <div className="tile black"><span>Seed phrases we ask for</span><CountUp value={0} /></div>
    </div>
  );
}

const ART: Record<string, React.ReactNode> = {
  open: (
    <svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M60 10 100 24v34c0 26-17 44-40 52-23-8-40-26-40-52V24L60 10Z" fill="#fff" />
      <path d="m40 60 14 14 28-30" strokeWidth="7" />
    </svg>
  ),
  points: (
    <svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" strokeWidth="4" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="60" cy="86" rx="38" ry="14" fill="#fff" /><ellipse cx="60" cy="68" rx="38" ry="14" fill="#fff" />
      <ellipse cx="60" cy="50" rx="38" ry="14" fill="#ff5a1f" /><ellipse cx="60" cy="32" rx="38" ry="14" fill="#fff" />
    </svg>
  ),
  unconfirmed: (
    <svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
      <circle cx="60" cy="60" r="46" fill="#fff" />
      <path d="M46 48c0-9 6-15 14-15s14 6 14 13c0 11-14 11-14 24" strokeWidth="7" />
      <circle cx="60" cy="86" r="4.5" fill="#0d0d0f" />
    </svg>
  ),
  ended: (
    <svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="#fff" />
      <path d="M60 32v28l20 12" strokeWidth="7" />
      <circle cx="60" cy="60" r="5" fill="#0d0d0f" />
    </svg>
  ),
};

const CATS = [
  { k: "open", cls: "c-lime", title: "Open now", text: "A claim or reward program is live, with a deadline we can cite." },
  { k: "points", cls: "c-peach", title: "Points only", text: "Tasks earn points, but no token has been announced. Treat it as a maybe." },
  { k: "unconfirmed", cls: "c-sky", title: "Unconfirmed", text: "Talked about a lot, but the project has announced nothing. Not a plan." },
  { k: "ended", cls: "c-pink", title: "Closed", text: "The claim window or season is over. Kept so you can see what happened." },
] as const;

export function Cats() {
  const { now, showList } = useApp();
  return (
    <div className="cats reveal">
      {CATS.map((c) => {
        const n = LISTINGS.filter((p) => eff(p, now) === c.k).length;
        return (
          <button key={c.k} className={"cat " + c.cls} type="button" onClick={() => showList(c.k)}>
            <div className="art">{ART[c.k]}</div>
            <div><h3>{c.title}</h3></div>
            <p>{c.text}</p>
            <div className="go">
              <span className="btn btn-sm btn-ink" style={{ pointerEvents: "none" }}>Show list <Icon id="i-arrow" className="i arr" /></span>
              <span className="cnt">{n} listed</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
