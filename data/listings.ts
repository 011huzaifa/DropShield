/**
 * ──────────────────────────────────────────────────────────────────────────
 *  LISTINGS: this is the only file you need to edit to change the airdrop list.
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  ADD a listing:    copy the TEMPLATE below, paste it at the top of LISTINGS, fill it in.
 *  EDIT a listing:   change its fields. To use your own referral link, set  referralUrl: "https://...".
 *  REMOVE a listing: delete its block.
 *  After any change: update LAST_CHECKED in data/site.ts, commit, and push. Vercel redeploys on its own.
 *
 *  Status values:  "open" (live claim with a source), "points" (points only, no token announced),
 *                  "unconfirmed" (talked about, project announced nothing), "ended" (closed).
 *  An "open" listing with a deadline turns into "Closed" automatically once the deadline passes.
 *
 *  TEMPLATE
 *  {
 *    id: "projectname",
 *    name: "Project Name",
 *    status: "points",
 *    tag: "Testnet",                       // optional
 *    chain: "Ethereum",
 *    reward: "Points",
 *    who: "Who qualifies",
 *    deadline: null,                       // or "2026-12-31T08:00:00Z"
 *    closes: "No end date listed",
 *    hue: [200, 260],
 *    official: "project.xyz",              // plain text address, or null
 *    referralUrl: null,                    // or "https://project.xyz/?ref=YOURCODE"
 *    summary: "One or two plain sentences.",
 *    flags: [{ l: "warn", t: "Something to be careful about." }],
 *    tasks: ["First step", "Second step"],
 *    sources: [SRC.farm],                  // add new links in data/sources.ts
 *  },
 */
import type { Listing } from "./types";
import { SRC } from "./sources";

export const LISTINGS: Listing[] = [
  {
    id: "standx", name: "StandX", status: "open", chain: "BNB Chain or Solana", reward: "DUSD stablecoin", who: "Past StandX users",
    deadline: "2026-12-31T08:00:00Z", closes: "Dec 31, 2026 · 08:00 UTC", hue: [18, 345],
    official: "standx.com/airdrop", referralUrl: null,
    summary: "Claim DUSD based on your past activity on StandX. The planned token launch was cancelled and the platform is winding down, so unclaimed DUSD is forfeited after the deadline.",
    flags: [
      { l: "warn", t: "StandX confirmed there will be no token launch." },
      { l: "warn", t: "Open positions close Jan 15, 2027 and DUSD redemption and withdrawal end Jan 31, 2027." },
      { l: "warn", t: "Allocations can be cut or cancelled if an account is flagged as suspicious." },
      { l: "good", t: "Claimed DUSD has no lockup or vesting." },
      { l: "warn", t: "Reporting says any other site offering a DUSD claim is a scam." },
    ],
    tasks: ["Use the same wallet address you used on StandX", "Claim before Dec 31, 2026 at 08:00 UTC", "Redeem or withdraw your DUSD before Jan 31, 2027", "Ignore claim links sent to you in messages"],
    sources: [SRC.standx, SRC.ticker],
  },
  {
    id: "aster", name: "Aster Stage 6", status: "open", chain: "Not stated in sources", reward: "ASTER token", who: "Users who chose full vesting in April 2026",
    deadline: "2026-11-28T12:00:00Z", closes: "Nov 28, 2026 · 12:00 UTC", hue: [248, 215],
    official: "asterdex.com/en/airdrop/allocation", referralUrl: null,
    summary: "Stage 6 \"Convergence\" claim for users who picked the full-allocation option. 200 million ASTER is available for this stage.",
    flags: [
      { l: "warn", t: "The immediate-payout window (Apr 28 to May 28, 2026) has closed." },
      { l: "warn", t: "The April choice could not be changed afterward, so late changes do not count." },
      { l: "warn", t: "Some roundups list Nov 4 as the start date. The project's page names Oct 28." },
    ],
    tasks: ["Check whether you chose the full-vesting option in April", "Claim on the official Aster page before Nov 28, 2026 at 12:00 UTC"],
    sources: [SRC.ticker],
  },
  {
    id: "doppler", name: "Doppler Finance", status: "open", chain: "Base wallet", reward: "XDP token", who: "Users who registered before Jul 30, 2026",
    deadline: "2026-11-28T12:00:00Z", closes: "Nov 28, 2026 · 12:00 UTC", hue: [190, 160],
    official: "app.doppler.finance/airdrop", referralUrl: null,
    summary: "Genesis airdrop of 100 million XDP (1% of a 10 billion supply), fully unlocked at launch. Registration is closed.",
    flags: [
      { l: "warn", t: "Registration closed July 30, 2026, so only registered users can claim." },
      { l: "warn", t: "Unclaimed allocations expire after the deadline." },
      { l: "good", t: "The allocation is fully unlocked at launch." },
    ],
    tasks: ["Use the same Base wallet you registered with", "Claim before Nov 28, 2026 at 12:00 UTC"],
    sources: [SRC.ticker],
  },
  {
    id: "grass", name: "Grass Stage 2", status: "open", chain: "Not stated in sources", reward: "USDC payout", who: "Bandwidth providers, epochs 1 to 19",
    deadline: "2027-01-22T23:59:59Z", closes: "Jan 22, 2027", hue: [150, 190],
    official: "app.grass.io/dashboard", referralUrl: null,
    summary: "Stage 2 rewards are paid in USDC through your Grass dashboard. Payout ends after six months or once everything is claimed, whichever comes first.",
    flags: [
      { l: "warn", t: "Unclaimed rewards stay with Grass and are not redistributed." },
      { l: "warn", t: "No closing time is stated and the pool can run out earlier, so do not wait for the last day." },
      { l: "good", t: "Eligibility covers bandwidth provided between Oct 14, 2024 and Jun 8, 2026." },
    ],
    tasks: ["Open your Grass dashboard from the official address", "Claim your Stage 2 USDC before the deadline"],
    sources: [SRC.ticker],
  },
  {
    id: "baserewards", name: "Base App Launch Rewards", status: "open", chain: "Base", reward: "USDC from a limited pool", who: "App users under the current terms",
    deadline: "2026-12-21T20:00:00Z", closes: "Dec 21, 2026 · 12:00 PT", hue: [330, 270],
    official: null, referralUrl: null,
    summary: "A rewards program paid in USDC for signing up, using the app, trading and inviting friends. This is not a BASE token airdrop.",
    flags: [
      { l: "warn", t: "Not a BASE token airdrop. Base has only said it is exploring a network token." },
      { l: "warn", t: "Expect scam activity around year-end claims. Use only the official app and announcement." },
      { l: "warn", t: "The pool is limited and the terms can change." },
    ],
    tasks: ["Read the current terms in the official Base app", "Follow only what the terms describe", "Ignore anyone offering a \"BASE airdrop\""],
    sources: [SRC.farm],
  },
  {
    id: "primus", name: "Primus Labs", status: "points", chain: "EVM wallet", reward: "AlphaNet points", who: "Users completing zkTLS verification tasks",
    deadline: null, closes: "No end date listed", hue: [18, 345],
    official: null, referralUrl: null,
    summary: "Privacy-focused data verification project (formerly PADO). Its AlphaNet campaign lets users verify social identities with zkTLS proofs and build a reputation score.",
    flags: [
      { l: "warn", t: "A token has not been announced by the project, as of an Oct 20, 2026 guide." },
      { l: "warn", t: "Some guides call it a \"confirmed airdrop\". That goes further than the project has." },
      { l: "good", t: "A $6.5M seed round was reported in February 2025." },
      { l: "info", t: "The AlphaNet campaign launched on October 16, 2025 and has no announced end date." },
    ],
    tasks: ["Open the AlphaNet page from Primus Labs' own official site or verified account", "Connect an EVM wallet only on that official page", "Install the Primus extension only from the Chrome Web Store", "Complete the available verification tasks", "Never pay anyone to unlock rewards"],
    sources: [SRC.coinlaunch, SRC.bitrue, SRC.cryptorank, SRC.alert],
  },
  {
    id: "polyester", name: "Polyester Testnet", status: "unconfirmed", tag: "Testnet", chain: "Polyester testnet (EVM)", reward: "None announced",
    who: "Anyone who joins the testnet",
    deadline: null, closes: "No dates published", hue: [280, 320],
    official: "testnet.polyester.com", referralUrl: null,
    summary: "Testnet for Polyester, a decentralized spot and lending exchange on its own EVM Layer 1. You claim practice \"Paper Assets\" every 24 hours and test trading, deposits and withdrawals. No token or airdrop has been announced.",
    flags: [
      { l: "warn", t: "No token details, launch date or airdrop eligibility rules have been announced." },
      { l: "warn", t: "The project says it plans giveaways and trading competitions with real prizes, but no amounts, dates or rules are published." },
      { l: "warn", t: "Paper Assets are for testing only and have no stated value." },
      { l: "info", t: "The testnet portal accepts an EVM wallet, email or Google sign-in. The listing source says no KYC is needed." },
      { l: "info", t: "The project is reported to be backed by RRE Ventures. No funding amount is stated." },
      { l: "warn", t: "Most details here come from a single third-party page updated Oct 5, 2026. Confirm them on the project's own channels." },
    ],
    tasks: ["Type the testnet address yourself or use your own bookmark", "Use a fresh wallet that holds no real funds", "Claim your Paper Assets once every 24 hours", "Try spot trading, a test deposit and a test withdrawal", "Never pay anyone to unlock rewards"],
    sources: [SRC.polyester],
  },
  {
    id: "basetoken", name: "Base network token", status: "unconfirmed", chain: "Base", reward: "None announced", who: "Not announced",
    deadline: null, closes: "No dates published", hue: [330, 270],
    official: null, referralUrl: null,
    summary: "Base has said it is exploring a network token. No design, eligibility rules, snapshot or launch date has been published.",
    flags: [{ l: "warn", t: "Treat any \"BASE airdrop\" claim as a scam until Base announces one itself." }],
    tasks: ["Nothing to do yet", "Follow only Base's own announcements"],
    sources: [SRC.farm],
  },
  {
    id: "metamask", name: "MetaMask Rewards", status: "ended", chain: "Not applicable", reward: "Points (no token)", who: "Season 1 participants",
    deadline: null, closes: "Closed", hue: [28, 340],
    official: null, referralUrl: null,
    summary: "Season 1 ended in early 2026 and its claim window is closed. The current docs say there are no plans for a $MASK token.",
    flags: [
      { l: "warn", t: "Some roundups list a Nov 26 deadline and a Nov 12 opt-in. MetaMask's own pages contradict this." },
      { l: "warn", t: "Anyone offering a MASK airdrop now is not following MetaMask's published plans." },
    ],
    tasks: ["Nothing to claim", "Ignore any \"MASK airdrop\" link"],
    sources: [SRC.ticker, SRC.farm],
  },
];
