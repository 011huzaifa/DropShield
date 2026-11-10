"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Campaign, SiteSettings, Status } from "@/lib/types";
import { ORDER, PILL, STATUS, daysText, eff, grad, ms, shortDate, timing } from "@/lib/util";
import { Ico, Logo } from "./ui";
import LinkScanner from "./LinkScanner";
import CampaignModal from "./CampaignModal";

type Filter = "all" | "tracked" | Status;
type Sort = "deadline" | "name" | "status";

const CATS: { key: Status; cls: string; title: string; text: string; art: string }[] = [
  { key: "open", cls: "c-lime", title: "Open now", text: "A claim or reward program is live, with a deadline we can cite.",
    art: '<svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M60 10 100 24v34c0 26-17 44-40 52-23-8-40-26-40-52V24L60 10Z" fill="#fff"/><path d="m40 60 14 14 28-30" stroke-width="7"/></svg>' },
  { key: "points", cls: "c-peach", title: "Points only", text: "Tasks earn points, but no token has been announced. Treat it as a maybe.",
    art: '<svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" stroke-width="4" stroke-linejoin="round" aria-hidden="true"><ellipse cx="60" cy="86" rx="38" ry="14" fill="#fff"/><ellipse cx="60" cy="68" rx="38" ry="14" fill="#fff"/><ellipse cx="60" cy="50" rx="38" ry="14" fill="#ff5a1f"/><ellipse cx="60" cy="32" rx="38" ry="14" fill="#fff"/></svg>' },
  { key: "unconfirmed", cls: "c-sky", title: "Unconfirmed", text: "Talked about a lot, but the project has announced nothing. Not a plan.",
    art: '<svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" stroke-width="4" stroke-linecap="round" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="#fff"/><path d="M46 48c0-9 6-15 14-15s14 6 14 13c0 11-14 11-14 24" stroke-width="7"/><circle cx="60" cy="86" r="4.5" fill="#0d0d0f"/></svg>' },
  { key: "ended", cls: "c-pink", title: "Closed", text: "The claim window or season is over. Kept so you can see what happened.",
    art: '<svg width="124" height="124" viewBox="0 0 120 120" fill="none" stroke="#0d0d0f" stroke-width="4" stroke-linecap="round" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="#fff"/><path d="M60 32v28l20 12" stroke-width="7"/><circle cx="60" cy="60" r="5" fill="#0d0d0f"/></svg>' },
];
const CHIPS: [Filter, string][] = [["all", "All"], ["open", "Open now"], ["points", "Points only"], ["unconfirmed", "Unconfirmed"], ["ended", "Closed"], ["tracked", "My list"]];
const NAV: [string, string][] = [["how", "How it works"], ["explore", "Airdrops"], ["tools", "Link scanner"], ["method", "How we label"], ["faq", "FAQ"]];
const FAQ: [string, string][] = [
  ["Is an airdrop guaranteed if I finish the tasks?", "No. Even a confirmed campaign can change its rules, cut allocations or cancel. Treat every airdrop as a possible bonus, never as income you can plan on."],
  ["What does \"Points only\" mean?", "The project gives out points for tasks, but has not announced a token or said what the points are worth. It may turn into a reward later, or it may not."],
  ["Do I need to connect my wallet to use DropShield?", "No. Browsing the list and the link scanner need no wallet, and we never ask you to connect one or sign anything."],
  ["Where does the information come from?", "From public reporting and the projects' own announcements as reported there. Every card lists its sources and the date we last checked. Dates and rules can change, so confirm on the project's official channel before you act."],
  ["Why don't you link straight to claim pages?", "Scammers copy claim pages and spread them through messages. We show the official address as text, so you type it yourself or use your own bookmark. Then a fake link cannot reach you through us."],
  ["I found a mistake or an outdated date. What now?", "Trust the project's own channel over this page. Dates change often, and a listing can be out of date between checks."],
];
const SOC_ICON: Record<string, [string, string]> = { x: ["X", "i-x"], discord: ["Discord", "i-discord"], telegram: ["Telegram", "i-telegram"] };

export default function Site({ campaigns: DATA, site, initialNow }: { campaigns: Campaign[]; site: SiteSettings; initialNow: number }) {
  const LAST = site.lastChecked;
  const [now, setNow] = useState(initialNow);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("deadline");
  const [tracked, setTracked] = useState<string[]>([]);
  const [done, setDone] = useState<Record<string, number[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [bump, setBump] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const lastFocus = useRef<Element | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* load saved list from this device */
  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem("ds_tracked") || "[]");
      if (Array.isArray(t)) setTracked(t.filter((id: string) => DATA.some((p) => p.id === id)));
      const d = JSON.parse(localStorage.getItem("ds_done") || "{}");
      if (d && typeof d === "object") setDone(d);
    } catch {}
    setLoaded(true);
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(iv);
  }, [DATA]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("ds_tracked", JSON.stringify(tracked)); localStorage.setItem("ds_done", JSON.stringify(done)); } catch {}
  }, [tracked, done, loaded]);

  const toast = useCallback((m: string) => {
    setToastMsg(m); setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 2600);
  }, []);

  /* derived numbers */
  const openList = useMemo(() => DATA.filter((p) => eff(p, now) === "open" && p.deadline).sort((a, b) => ms(a, now)! - ms(b, now)!), [DATA, now]);
  const soon = DATA.filter((p) => eff(p, now) === "open" && p.deadline && ms(p, now)! < 30 * 86400000).length;
  const openCount = DATA.filter((p) => eff(p, now) === "open").length;
  const n0 = openList[0];
  const d0 = n0 ? Math.max(1, Math.ceil(ms(n0, now)! / 86400000)) : 0;
  const hasReferral = DATA.some((p) => p.referralUrl);

  function countFor(k: Filter) {
    if (k === "all") return DATA.length;
    if (k === "tracked") return tracked.length;
    return DATA.filter((p) => eff(p, now) === k).length;
  }
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const l = DATA.filter((p) => {
      if (status === "tracked") { if (tracked.indexOf(p.id) < 0) return false; }
      else if (status !== "all" && eff(p, now) !== status) return false;
      return !s || (p.name + " " + p.chain + " " + p.reward).toLowerCase().indexOf(s) >= 0;
    });
    l.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return (ORDER[eff(a, now)] - ORDER[eff(b, now)]) || a.name.localeCompare(b.name);
      const ra = eff(a, now) === "open" && a.deadline ? ms(a, now)! : 1e15, rb = eff(b, now) === "open" && b.deadline ? ms(b, now)! : 1e15;
      return (ra - rb) || (ORDER[eff(a, now)] - ORDER[eff(b, now)]) || a.name.localeCompare(b.name);
    });
    return l;
  }, [DATA, q, status, sort, tracked, now]);

  function toggleTrack(id: string) {
    setTracked((cur) => {
      const i = cur.indexOf(id);
      if (i >= 0) { toast("Removed from your list"); return cur.filter((x) => x !== id); }
      toast("Added to your list. Saved on this device.");
      return [...cur, id];
    });
    setBump(true); setTimeout(() => setBump(false), 260);
  }
  function openModal(id: string) { lastFocus.current = document.activeElement; setOpenId(id); }
  function closeModal() { setOpenId(null); (lastFocus.current as HTMLElement | null)?.focus?.(); }
  function toggleTask(id: string, i: number, checked: boolean) {
    setDone((cur) => {
      const arr = (cur[id] || []).filter((x) => x !== i);
      if (checked) arr.push(i);
      return { ...cur, [id]: arr };
    });
  }
  function goExplore(s: Filter) {
    setStatus(s);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => { document.body.style.overflow = openId ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [openId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenId(null); setMenu(false); } };
    const onScroll = () => setScrolled(window.scrollY > 8);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll); };
  }, []);

  /* scroll reveal, count-up and nav highlight */
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    function countUp(el: HTMLElement) {
      if (reduce) return;
      const to = parseInt(el.getAttribute("data-count") || "0", 10) || 0;
      if (to === 0) return;
      let t0: number | null = null;
      const step = (t: number) => {
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(to * e));
        if (k < 1) requestAnimationFrame(step); else el.textContent = String(to);
      };
      el.textContent = "0"; requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { reveals.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in"); io.unobserve(en.target);
        en.target.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
    const spy = Array.from(document.querySelectorAll<HTMLElement>("[data-spy]"));
    const so = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        spy.forEach((a) => a.classList.toggle("on", a.getAttribute("data-spy") === en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach(([id]) => { const s = document.getElementById(id); if (s) so.observe(s); });
    return () => { io.disconnect(); so.disconnect(); };
  }, []);

  const modalP = openId ? DATA.find((p) => p.id === openId) : undefined;
  const socials = Object.keys(SOC_ICON).filter((k) => /^https:\/\//.test((site.social as Record<string, string>)[k] || ""));
  const renderTicker = (pre: string) => DATA.map((p) => {
    const st = eff(p, now), dt = daysText(p, now);
    return (
      <span className="tp" key={pre + p.id}>
        <span className="m" style={{ background: grad(p) }}>{p.name.charAt(0)}</span>
        <b>{p.name}</b><small>{STATUS[st]}</small>
        {st === "open" && dt ? <span className="sc">{dt}</span> : null}
      </span>
    );
  });

  return (
    <>
      <header className={"nav" + (menu ? " open" : "") + (scrolled ? " scrolled" : "")} id="nav">
        <div className="wrap">
          <div className="nav-in">
            <a className="logo" href="#top" aria-label="DropShield home"><Logo />DropShield</a>
            <nav className="nav-links" aria-label="Primary">
              {NAV.map(([id, label]) => <a key={id} href={"#" + id} data-spy={id}>{label}</a>)}
            </nav>
            <div className="nav-end">
              <button className="btn btn-ghost btn-sm" type="button" aria-label="Show my tracked airdrops" onClick={() => goExplore("tracked")}>
                My list <span className={"count" + (bump ? " bump" : "")}>{tracked.length}</span>
              </button>
              <a className="btn btn-orange btn-sm" href="#explore">Browse airdrops</a>
              <button className="burger" type="button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mnav" onClick={() => setMenu((m) => !m)}><span></span></button>
            </div>
          </div>
          <nav className="mnav" id="mnav" aria-label="Mobile">
            {NAV.map(([id, label]) => <a key={id} href={"#" + id} onClick={() => setMenu(false)}>{label} <Ico id="i-arrow" /></a>)}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Airdrop safety radar</span>
              <h1 className="h1"><span>Find real airdrops.</span><span className="accent">Avoid the scams.</span></h1>
              <p className="lead">See which airdrops are open right now, which are only points programs, and which are just rumors. Every card shows its deadline and its sources, and a link scanner checks suspicious claim links.</p>
              <div className="hero-cta">
                <a className="btn btn-ink" href="#explore">Browse airdrops <Ico id="i-arrow" className="i arr" /></a>
                <a className="btn btn-ghost" href="#tools">Scan a link</a>
              </div>
              <ul className="checks">
                <li><span className="tick">✓</span>No wallet connection</li>
                <li><span className="tick">✓</span>No seed phrase, ever</li>
                <li><span className="tick">✓</span>Free to use</li>
              </ul>
            </div>

            <div className="stage ht" aria-label="Closing soon preview">
              <span className="stage-chip"><span className="live"></span><span>Updated {shortDate(LAST)}</span></span>
              <div className="phone">
                <div className="ph-top"><b>Closing soon</b><span>Open now</span></div>
                <div className="nd">
                  <small>Next deadline</small>
                  {n0 ? (<><b>{d0}</b><span>{d0 === 1 ? "day" : "days"} · {n0.name}</span></>) : (<><b>None</b><span>No open claims right now</span></>)}
                </div>
                <div className="ph-actions">
                  <div><Ico id="i-shield" />Status</div>
                  <div><Ico id="i-link" />Scan</div>
                  <div><Ico id="i-bookmark" />Track</div>
                  <div><Ico id="i-eye" />Sources</div>
                </div>
                <div className="ph-list">
                  {openList.slice(0, 3).map((p) => (
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
          </div>
        </section>

        <div className="ticker" aria-label="Tracked campaigns"><div className="rail">{renderTicker("a")}{renderTicker("b")}</div></div>

        <section className="sec" id="how">
          <div className="wrap">
            <div className="sh reveal">
              <span className="eyebrow">How it works</span>
              <h2 className="h2">Three steps from &quot;is this real?&quot; to a clear answer</h2>
              <p className="lead">No account needed. Everything runs in your browser.</p>
            </div>
            <div className="steps">
              <div className="step reveal"><span className="n">1</span><h3 className="h3">Find a campaign</h3><p>Browse the list or search by name or network. Each card says whether it is open now, points only, unconfirmed or closed.</p><span className="ex">Open now · Points only · Unconfirmed · Closed</span></div>
              <div className="step reveal"><span className="n">2</span><h3 className="h3">Check the deadline and fine print</h3><p>Every card shows when it closes, who qualifies and what to watch out for. Open it for sources and a checklist.</p><span className="ex">Deadlines are shown in UTC</span></div>
              <div className="step reveal"><span className="n">3</span><h3 className="h3">Go to the official page yourself</h3><p>Type the project&apos;s address or use your own bookmark. Paste any link you were sent into the scanner first.</p><span className="ex">Your list is saved on this device</span></div>
            </div>
          </div>
        </section>

        <section className="sec tight">
          <div className="wrap">
            <div className="tiles reveal">
              <div className="tile"><span>Campaigns tracked</span><b data-count={DATA.length}>{DATA.length}</b></div>
              <div className="tile indigo"><span>Open right now</span><b data-count={openCount}>{openCount}</b></div>
              <div className="tile"><span>Closing in 30 days</span><b data-count={soon}>{soon}</b></div>
              <div className="tile black"><span>Seed phrases we ask for</span><b data-count={0}>0</b></div>
            </div>
            <p className="checked foot-note">Counted live from the listings below.</p>
          </div>
        </section>

        <section className="sec" id="labels">
          <div className="wrap">
            <div className="sh reveal">
              <span className="eyebrow">Status labels</span>
              <h2 className="h2">Four labels, each one earned</h2>
              <p className="lead">Many sites call every campaign a &quot;confirmed airdrop&quot;. We only use the label the evidence supports. Tap a tile to filter the list.</p>
            </div>
            <div className="cats reveal">
              {CATS.map((c) => (
                <button key={c.key} className={"cat " + c.cls} type="button" onClick={() => goExplore(c.key)}>
                  <div className="art" dangerouslySetInnerHTML={{ __html: c.art }} />
                  <div><h3>{c.title}</h3></div>
                  <p>{c.text}</p>
                  <div className="go">
                    <span className="btn btn-sm btn-ink" style={{ pointerEvents: "none" }}>Show list <Ico id="i-arrow" className="i arr" /></span>
                    <span className="cnt">{countFor(c.key)} listed</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="sec tight" id="explore">
          <div className="wrap">
            <div className="sh reveal">
              <span className="eyebrow">Airdrops</span>
              <h2 className="h2">Every campaign in one place</h2>
              <p className="lead">Last checked <b>{LAST}</b> from public reporting. Dates can change, so confirm on the project&apos;s own channel before you act.</p>
            </div>
            <div className="panel reveal">
              <div className="toolbar">
                <label className="search">
                  <Ico id="i-search" style={{ fontSize: 18 }} />
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
                  <button key={k} className="chip" type="button" aria-pressed={status === k} onClick={() => setStatus(k)}>{label} <i>{countFor(k)}</i></button>
                ))}
              </div>
              <div className="grid" aria-live="polite">
                {list.length === 0 ? (
                  <div className="empty">{status === "tracked" ? "Your list is empty. Tap the bookmark on any card to track it." : "No campaigns match. Try another filter or search term."}</div>
                ) : list.map((p, i) => {
                  const on = tracked.indexOf(p.id) >= 0, st = eff(p, now), dt = daysText(p, now);
                  return (
                    <article className="card" key={p.id} style={{ ["--i" as string]: i } as React.CSSProperties} onClick={() => openModal(p.id)}>
                      <div className="card-top">
                        <div className="mk" style={{ background: grad(p) }}>{p.name.charAt(0)}</div>
                        <div className="meta"><h3>{p.name}</h3><div className="sub">{p.reward}</div></div>
                        {st === "open" && dt ? <span className="dl" style={{ background: "var(--ink)" }}>{dt}</span> : null}
                      </div>
                      <div><span className={"pill " + PILL[st]}>{STATUS[st]}</span></div>
                      <p className="sum">{p.summary}</p>
                      <div className="facts">
                        <div className="fact"><span>Timing</span><b>{timing(p, now)}</b></div>
                        <div className="fact"><span>Network</span><b>{p.chain}</b></div>
                        <div className="fact" style={{ gridColumn: "1/-1" }}><span>Who qualifies</span><b>{p.who}</b></div>
                      </div>
                      <div className="card-foot">
                        <span className="tag">Checked {shortDate(LAST)}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button className="tb" type="button" aria-pressed={on} aria-label={(on ? "Remove " : "Track ") + p.name}
                            onClick={(e) => { e.stopPropagation(); toggleTrack(p.id); }}>
                            <Ico id="i-bookmark" style={{ fontSize: 18, ...(on ? { fill: "currentColor" } : {}) }} />
                          </button>
                          <button className="btn btn-ink btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openModal(p.id); }}>Details</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="tools">
          <div className="wrap">
            <div className="sh reveal">
              <span className="eyebrow">Link scanner</span>
              <h2 className="h2">Scan a link before you click or connect</h2>
              <p className="lead">Runs in your browser. Nothing you paste is sent anywhere.</p>
            </div>
            <div className="tools">
              <div className="tool reveal">
                <div className="tool-head"><span className="tool-ic"><Ico id="i-shield" /></span><h3 className="h3" style={{ fontSize: 26 }}>What it looks for</h3></div>
                <p className="d">Scam sites reuse the same tricks. The scanner checks the address itself for the common ones:</p>
                <ul className="scan-list">
                  <li><span className="tick">✓</span><span>Lookalike or disguised domains, including hidden characters</span></li>
                  <li><span className="tick">✓</span><span>Bait words like claim, free, reward and giveaway in the domain</span></li>
                  <li><span className="tick">✓</span><span>Throwaway domain endings and long chains of hyphens or subdomains</span></li>
                  <li><span className="tick">✓</span><span>Paths that ask you to connect, verify or restore a wallet</span></li>
                </ul>
                <div className="notice"><Ico id="i-warn" style={{ fontSize: 16 }} /><span>A clean result is not a guarantee. Open projects from their official site, never from a message.</span></div>
              </div>
              <LinkScanner />
            </div>
          </div>
        </section>

        <section className="sec tight" id="method">
          <div className="wrap">
            <div className="method reveal">
              <div>
                <span className="eyebrow">How we label</span>
                <h2 className="h2" style={{ marginTop: 14 }}>Every label has <span>a rule behind it.</span></h2>
                <p className="lead">We compile from public reporting and project announcements, cite the sources on every card, and show the date we last checked. If we cannot confirm something, we say so instead of guessing.</p>
              </div>
              <div className="wlist">
                <div className="w"><span className="sw" style={{ background: "var(--lime)" }}><Ico id="i-shield" /></span><div><h3>Open now</h3><p>A claim or reward program is live and we can cite a source with its deadline.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--peach)" }}><Ico id="i-bookmark" /></span><div><h3>Points only</h3><p>Tasks earn points, but the project has not announced a token.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--sky)" }}><Ico id="i-chat" /></span><div><h3>Unconfirmed</h3><p>Widely discussed, but the project itself has announced nothing.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--pink)" }}><Ico id="i-lock" /></span><div><h3>Closed</h3><p>The claim window or season is over. Kept so you can see what happened.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="sh reveal"><span className="eyebrow">Our rules</span><h2 className="h2">Protection first, hype last</h2></div>
            <div className="t3">
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--lime)" }}><Ico id="i-lock" /></span><h3 className="h3">No keys, ever</h3><p>We never ask for a seed phrase or private key, and we never ask you to connect a wallet.</p></div>
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--sky)" }}><Ico id="i-link" /></span><h3 className="h3">Sources on every card</h3><p>Each listing links to the reporting it is based on, with the date it was last checked.</p></div>
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--peach)" }}><Ico id="i-chat" /></span><h3 className="h3">Plain language</h3><p>&quot;Points only&quot; means points only. If a token has not been announced, the card says so.</p></div>
            </div>
          </div>
        </section>

        <section className="sec tight" id="faq">
          <div className="wrap">
            <div className="sh center reveal"><span className="eyebrow">FAQ</span><h2 className="h2">Quick answers</h2></div>
            <div className="faq reveal">
              {FAQ.map(([qq, a], i) => (
                <details key={qq} open={i === 0}><summary>{qq}<span className="pm"><Ico id="i-plus" /></span></summary><div className="ans">{a}</div></details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec tight">
          <div className="wrap">
            <div className="cta-card reveal">
              <h2>Know before you claim.</h2>
              <div className="cta-row">
                <a className="btn btn-ink" href="#explore">Browse airdrops <Ico id="i-arrow" className="i arr" /></a>
                <span>Free to browse. No wallet connection. No keys.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="sec tight" style={{ paddingBottom: 56 }}>
        <div className="wrap">
          <div className="fblack" id="fblack" style={socials.length ? { gridTemplateColumns: "minmax(0,1fr) auto" } : undefined}>
            <div>
              <span className="logo"><Logo />DropShield</span>
              <h3>The safer way to follow airdrops</h3>
              <a className="btn btn-orange" href="#explore">Browse airdrops <Ico id="i-arrow" className="i arr" /></a>
            </div>
            {socials.length > 0 && (
              <div className="fsoc">
                {socials.map((k) => (
                  <a key={k} href={(site.social as Record<string, string>)[k]} target="_blank" rel="noopener noreferrer" aria-label={SOC_ICON[k][0]}><Ico id={SOC_ICON[k][1]} /></a>
                ))}
              </div>
            )}
          </div>
          <div className="fcols">
            <div><h6>Explore</h6><a href="#explore">All airdrops</a><a href="#labels">Status labels</a></div>
            <div><h6>Safety</h6><a href="#tools">Link scanner</a><a href="#method">How we label</a></div>
            <div><h6>Help</h6><a href="#how">How it works</a><a href="#faq">FAQ</a></div>
          </div>
          <p className="legal">
            DropShield is an information service and not financial advice. Listings are compiled from public reporting and may be out of date, so always confirm on the project&apos;s official channel. Airdrops are never guaranteed and can be changed or cancelled by the project. DropShield will never ask for a seed phrase or private key, and will never ask you to connect a wallet.
            {hasReferral ? " Some listings include referral links. If you sign up through one, DropShield may earn a reward at no cost to you." : ""}
          </p>
        </div>
      </footer>

      <div className={"toast" + (toastOn ? " show" : "")} role="status">{toastMsg}</div>
      {modalP && (
        <CampaignModal p={modalP} now={now} lastChecked={LAST} tracked={tracked.indexOf(modalP.id) >= 0} done={done[modalP.id] || []}
          onClose={closeModal} onToggleTrack={() => toggleTrack(modalP.id)} onToggleTask={(i, c) => toggleTask(modalP.id, i, c)} toast={toast} />
      )}
    </>
  );
}
