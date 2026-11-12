import { SOCIAL } from "@/data/site";
import { Icon, Logo } from "./Icon";

const ICONS = { x: ["X", "i-x"], discord: ["Discord", "i-discord"], telegram: ["Telegram", "i-telegram"] } as const;

export function Footer() {
  const links = (Object.keys(ICONS) as (keyof typeof ICONS)[]).filter((k) => /^https:\/\//.test(SOCIAL[k] || ""));
  return (
    <footer className="sec tight" style={{ paddingBottom: 56 }}>
      <div className="wrap">
        <div className="fblack" style={links.length ? { gridTemplateColumns: "minmax(0,1fr) auto" } : undefined}>
          <div>
            <span className="logo"><Logo />DropShield</span>
            <h3>The safer way to follow airdrops</h3>
            <a className="btn btn-orange" href="#explore">Browse airdrops <Icon id="i-arrow" className="i arr" /></a>
          </div>
          {links.length ? (
            <div className="fsoc">
              {links.map((k) => (
                <a key={k} href={SOCIAL[k]} target="_blank" rel="noopener noreferrer" aria-label={ICONS[k][0]}><Icon id={ICONS[k][1]} /></a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="fcols">
          <div><h6>Explore</h6><a href="#explore">All airdrops</a><a href="#labels">Status labels</a></div>
          <div><h6>Safety</h6><a href="#tools">Link scanner</a><a href="#method">How we label</a></div>
          <div><h6>Help</h6><a href="#how">How it works</a><a href="#faq">FAQ</a></div>
        </div>
        <p className="legal">
          DropShield is an information service and not financial advice. Listings are compiled from public reporting and may be out of date, so always confirm on the project&apos;s official channel. Airdrops are never guaranteed and can be changed or cancelled by the project. DropShield will never ask for a seed phrase or private key, and will never ask you to connect a wallet. Project names belong to their owners, and a listing is not an endorsement.
        </p>
      </div>
    </footer>
  );
}
