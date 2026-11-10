import type { Campaign } from "./types";

/**
 * Content policy. Campaigns in these categories are never shown on the site
 * and cannot be saved from the admin panel.
 */
export const BLOCKED_CATEGORIES: Record<string, string> = {
  "prediction-market": "Prediction markets",
  gambling: "Gambling, casino, betting",
  "lending-interest": "Interest-based lending / yield (riba)",
  "leveraged-trading": "Leveraged derivatives / perps",
  adult: "Adult / porn / adultery",
  abusive: "Abusive / hateful content",
};

/** Categories you can pick in the admin panel */
export const ALLOWED_CATEGORIES: Record<string, string> = {
  wallet: "Wallet",
  "l2-network": "Layer 1 / Layer 2 network",
  infrastructure: "Infrastructure / tooling",
  depin: "DePIN",
  "rewards-program": "Rewards program",
  ai: "AI",
  gaming: "Gaming (non-gambling)",
  social: "Social / community",
  other: "Other",
};

/** Words that must not appear in the text of a listing. Extra safety net on top of categories. */
const BLOCKED_WORDS = [
  "casino", "betting", "sportsbook", "gambling", "lottery", "poker",
  "prediction market", "prediction-market", "polymarket",
  "porn", "xxx", "nsfw", "escort", "adult content", "onlyfans",
  "dating hookup",
  "interest-bearing", "lending", "borrow", "perpetual", "perps", "leverage",
];

export function isBlocked(c: Pick<Campaign, "category">): boolean {
  return c.category in BLOCKED_CATEGORIES;
}

export function findBlockedWord(c: Campaign): string | null {
  const text = [c.name, c.summary, c.reward, c.who, c.chain, c.category].join(" ").toLowerCase();
  for (const w of BLOCKED_WORDS) if (text.includes(w)) return w;
  return null;
}
