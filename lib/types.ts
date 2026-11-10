export type Status = "open" | "points" | "unconfirmed" | "ended";
export type FlagLevel = "good" | "warn" | "info";

export type Campaign = {
  id: string;
  name: string;
  status: Status;
  category: string;
  chain: string;
  reward: string;
  who: string;
  /** ISO date-time, or null when there is no fixed deadline */
  deadline: string | null;
  /** Human-readable closing text shown on the card */
  closes: string;
  /** Two hues (0-360) for the gradient logo. Optional: derived from the id if missing. */
  hue?: [number, number];
  /** Official address, shown as text only (type it yourself) */
  official: string | null;
  /** Your referral / affiliate link (https://...). Shown with a clear disclosure. */
  referralUrl: string | null;
  summary: string;
  flags: { l: FlagLevel; t: string }[];
  tasks: string[];
  sources: { t: string; u: string }[];
  /** Set to false to hide a campaign without deleting it */
  visible?: boolean;
};

export type SiteSettings = {
  lastChecked: string;
  social: { x: string; discord: string; telegram: string };
};
