import { AppProvider } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { HeroStage, Ticker, Tiles, Cats } from "@/components/Live";
import { Explorer } from "@/components/Explorer";
import { Scanner } from "@/components/Scanner";
import { Footer } from "@/components/Footer";
import { PageEffects } from "@/components/PageEffects";
import { Icon } from "@/components/Icon";
import { LISTINGS } from "@/data/listings";
import { LAST_CHECKED } from "@/data/site";

/** Rebuilt at most once an hour so the "days left" numbers stay fresh. */
export const revalidate = 3600;

const hasReferral = LISTINGS.some((l) => !!l.referralUrl);

const FAQ: [string, React.ReactNode][] = [
  ["Is an airdrop guaranteed if I finish the tasks?", "No. Even a confirmed campaign can change its rules, cut allocations or cancel. Treat every airdrop as a possible bonus, never as income you can plan on."],
  ["What does \"Points only\" mean?", "The project gives out points for tasks, but has not announced a token or said what the points are worth. It may turn into a reward later, or it may not."],
  ["Do I need to connect my wallet to use DropShield?", "No. Browsing the list and the link scanner need no wallet, and we never ask you to connect one or sign anything."],
  ["Where does the information come from?", "From public reporting and the projects' own announcements as reported there. Every card lists its sources and the date we last checked. Dates and rules can change, so confirm on the project's official channel before you act."],
  ["Why don't you link straight to claim pages?", hasReferral
    ? "Scammers copy claim pages and spread them through messages. We show official addresses as text, so you type them yourself or use your own bookmark. Where a listing has an \"Open official page\" button, it is a labelled referral link to the project's real site, and DropShield may earn a reward from it."
    : "Scammers copy claim pages and spread them through messages. We show the official address as text, so you type it yourself or use your own bookmark. Then a fake link cannot reach you through us."],
  ["How do you choose which campaigns to list?", "We list a campaign only when we can cite a source for what we say about it. A shorter list you can check is better than a long one full of guesses."],
  ["I found a mistake or an outdated date. What now?", "Trust the project's own channel over this page. Dates change often, and a listing can be out of date between checks."],
];

export default function Home() {
  return (
    <AppProvider serverNow={Date.now()}>
      <Header />
      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Airdrop safety radar</span>
              <h1 className="h1"><span>Find real airdrops.</span><span className="accent">Avoid the scams.</span></h1>
              <p className="lead">See which airdrops are open right now, which are only points programs, and which are just rumors. Every card shows its deadline and its sources, and a link scanner checks suspicious claim links.</p>
              <div className="hero-cta">
                <a className="btn btn-ink" href="#explore">Browse airdrops <Icon id="i-arrow" className="i arr" /></a>
                <a className="btn btn-ghost" href="#tools">Scan a link</a>
              </div>
              <ul className="checks">
                <li><span className="tick">✓</span>No wallet connection</li>
                <li><span className="tick">✓</span>No seed phrase, ever</li>
                <li><span className="tick">✓</span>Free to use</li>
              </ul>
            </div>
            <HeroStage />
          </div>
        </section>

        <Ticker />

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
            <Tiles />
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
            <Cats />
          </div>
        </section>

        <section className="sec tight" id="explore">
          <div className="wrap">
            <div className="sh reveal">
              <span className="eyebrow">Airdrops</span>
              <h2 className="h2">Every campaign in one place</h2>
              <p className="lead">Last checked <b>{LAST_CHECKED}</b> from public reporting. Dates can change, so confirm on the project&apos;s own channel before you act.</p>
            </div>
            <Explorer />
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
                <div className="tool-head"><span className="tool-ic"><Icon id="i-shield" /></span><h3 className="h3" style={{ fontSize: 26 }}>What it looks for</h3></div>
                <p className="d">Scam sites reuse the same tricks. The scanner checks the address itself for the common ones:</p>
                <ul className="scan-list">
                  <li><span className="tick">✓</span><span>Lookalike or disguised domains, including hidden characters</span></li>
                  <li><span className="tick">✓</span><span>Bait words like claim, free, reward and giveaway in the domain</span></li>
                  <li><span className="tick">✓</span><span>Throwaway domain endings and long chains of hyphens or subdomains</span></li>
                  <li><span className="tick">✓</span><span>Paths that ask you to connect, verify or restore a wallet</span></li>
                </ul>
                <div className="notice"><Icon id="i-warn" style={{ fontSize: 16 }} /><span>A clean result is not a guarantee. Open projects from their official site, never from a message.</span></div>
              </div>
              <div className="tool reveal">
                <div className="tool-head"><span className="tool-ic o"><Icon id="i-link" /></span><h3 className="h3" style={{ fontSize: 26 }}>Check a link</h3></div>
                <Scanner />
              </div>
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
                <div className="w"><span className="sw" style={{ background: "var(--lime)" }}><Icon id="i-shield" /></span><div><h3>Open now</h3><p>A claim or reward program is live and we can cite a source with its deadline.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--peach)" }}><Icon id="i-bookmark" /></span><div><h3>Points only</h3><p>Tasks earn points, but the project has not announced a token.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--sky)" }}><Icon id="i-chat" /></span><div><h3>Unconfirmed</h3><p>Widely discussed, but the project itself has announced nothing.</p></div></div>
                <div className="w"><span className="sw" style={{ background: "var(--pink)" }}><Icon id="i-lock" /></span><div><h3>Closed</h3><p>The claim window or season is over. Kept so you can see what happened.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="sh reveal"><span className="eyebrow">Our rules</span><h2 className="h2">Protection first, hype last</h2></div>
            <div className="t3">
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--lime)" }}><Icon id="i-lock" /></span><h3 className="h3">No keys, ever</h3><p>We never ask for a seed phrase or private key, and we never ask you to connect a wallet.</p></div>
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--sky)" }}><Icon id="i-link" /></span><h3 className="h3">Sources on every card</h3><p>Each listing links to the reporting it is based on, with the date it was last checked.</p></div>
              <div className="tcard reveal"><span className="ib" style={{ background: "var(--peach)" }}><Icon id="i-chat" /></span><h3 className="h3">Plain language</h3><p>&quot;Points only&quot; means points only. If a token has not been announced, the card says so.</p></div>
            </div>
          </div>
        </section>

        <section className="sec tight" id="faq">
          <div className="wrap">
            <div className="sh center reveal"><span className="eyebrow">FAQ</span><h2 className="h2">Quick answers</h2></div>
            <div className="faq reveal">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>{q}<span className="pm"><Icon id="i-plus" /></span></summary>
                  <div className="ans">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec tight">
          <div className="wrap">
            <div className="cta-card reveal">
              <h2>Know before you claim.</h2>
              <div className="cta-row">
                <a className="btn btn-ink" href="#explore">Browse airdrops <Icon id="i-arrow" className="i arr" /></a>
                <span>Free to browse. No wallet connection. No keys.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <PageEffects />
    </AppProvider>
  );
}
