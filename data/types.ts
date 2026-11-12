export type Status = "open" | "points" | "unconfirmed" | "ended";

export type Flag = {
  /** warn = caution, good = positive fact, info = neutral note */
  l: "warn" | "good" | "info";
  t: string;
};

export type Source = { t: string; u: string };

export type Listing = {
  /** Unique, lowercase, no spaces. Never change it after launch, because visitors' saved lists use it. */
  id: string;
  name: string;
  status: Status;
  /** Optional small label on the card, for example "Testnet" or "Mainnet". */
  tag?: string;
  chain: string;
  reward: string;
  who: string;
  /** ISO time in UTC, for example "2026-12-31T08:00:00Z". Use null when there is no deadline. */
  deadline: string | null;
  /** Human text for the deadline or timing, for example "Dec 31, 2026 · 08:00 UTC". */
  closes: string;
  /** Two numbers 0 to 360. They pick the gradient colours of the logo tile. */
  hue: [number, number];
  /** The project's official address as plain text (no https://). Shown as copyable text. */
  official: string | null;
  /**
   * YOUR referral link for this project (full https:// address). When set, the listing shows an
   * "Open official page" button that uses this link and is labelled as a referral link.
   * Leave it out or null for no button.
   */
  referralUrl?: string | null;
  summary: string;
  flags: Flag[];
  tasks: string[];
  sources: Source[];
  /** Optional. Overrides LAST_CHECKED for this one listing, e.g. "Nov 12, 2026". */
  checked?: string;
};
