"use client";
import { useState } from "react";
import { scanLink, type ScanResult } from "@/lib/scan";
import { Ico, Ring } from "./ui";

export default function LinkScanner() {
  const [value, setValue] = useState("");
  const [res, setRes] = useState<ScanResult | null>(null);

  function run(v: string) {
    const r = scanLink(v);
    if (r.kind === "seed") setValue("");
    setRes(r);
  }

  let out: React.ReactNode = <div className="hint">Results appear here. Paste a link or use an example.</div>;
  if (res) {
    if (res.kind === "empty") out = <div className="hint">Paste a link first, or use an example.</div>;
    else if (res.kind === "seed")
      out = (
        <div className="verdict v-bad"><div><b>That looks like a seed phrase, not a link</b>
          <ul className="rf"><li>We cleared it from the box. Never paste a seed phrase into any website.</li><li>If you typed it anywhere else, move your funds to a new wallet.</li></ul></div></div>
      );
    else if (res.kind === "unreadable")
      out = (
        <div className="verdict v-warn"><div><b>Could not read that link</b>
          <ul className="rf"><li>Paste the full address, for example https://example.com/page.</li></ul></div></div>
      );
    else
      out = (
        <>
          <div className={"verdict v-" + res.cls}>
            <div className="ring"><Ring score={100 - res.risk} size={60} stroke={6} /></div>
            <div style={{ minWidth: 0 }}>
              <b>{res.title}</b>
              <div className="mono small" style={{ overflowWrap: "anywhere", marginTop: 2 }}>{res.host}</div>
              {res.flags.length > 0 && <ul className="rf">{res.flags.map((f) => <li key={f}>{f}</li>)}</ul>}
            </div>
          </div>
          <p className="disc">This checks the address pattern only. A clean result is not a guarantee.</p>
        </>
      );
  }

  return (
    <div className="tool reveal" id="linkTool">
      <div className="tool-head"><span className="tool-ic o"><Ico id="i-link" /></span><h3 className="h3" style={{ fontSize: 26 }}>Check a link</h3></div>
      <form className="field" autoComplete="off" onSubmit={(e) => { e.preventDefault(); run(value); }}>
        <input type="text" placeholder="https://…" aria-label="Link to scan" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn btn-ink" type="submit">Scan link</button>
      </form>
      <div className="try">Try an example:{" "}
        <button type="button" onClick={() => { const v = "https://free-eth-claim-now.xyz/connect-wallet"; setValue(v); run(v); }}>risky link</button>
        <button type="button" onClick={() => { const v = "https://docs.example.org/guide"; setValue(v); run(v); }}>normal link</button>
      </div>
      <div className="result" aria-live="polite">{out}</div>
    </div>
  );
}
