"use client";

import { useEffect, useState } from "react";
import { Icon, Logo } from "./Icon";
import { useApp } from "./AppProvider";

const LINKS = [
  { id: "how", label: "How it works" },
  { id: "explore", label: "Airdrops" },
  { id: "tools", label: "Link scanner" },
  { id: "method", label: "How we label" },
  { id: "faq", label: "FAQ" },
];

export function Header() {
  const { tracked, bump, showList } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => es.forEach((en) => en.isIntersecting && setActive(en.target.id)),
        { rootMargin: "-45% 0px -50% 0px" },
      );
      LINKS.forEach((l) => {
        const el = document.getElementById(l.id);
        if (el) io!.observe(el);
      });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
      io?.disconnect();
    };
  }, []);

  return (
    <header className={"nav" + (open ? " open" : "") + (scrolled ? " scrolled" : "")} id="nav">
      <div className="wrap">
        <div className="nav-in">
          <a className="logo" href="#top" aria-label="DropShield home">
            <Logo />
            DropShield
          </a>
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={active === l.id ? "on" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-end">
            <button className="btn btn-ghost btn-sm" type="button" aria-label="Show my tracked airdrops" onClick={() => showList("tracked")}>
              My list <span className={"count" + (bump ? " bump" : "")}>{tracked.length}</span>
            </button>
            <a className="btn btn-orange btn-sm" href="#explore">Browse airdrops</a>
            <button
              className="burger"
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mnav"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
            </button>
          </div>
        </div>
        <nav className="mnav" id="mnav" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
              {l.label} <Icon id="i-arrow" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
