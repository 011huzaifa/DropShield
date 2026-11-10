import fs from "node:fs";
import path from "node:path";
import type { Campaign, SiteSettings } from "./types";
import { isBlocked } from "./policy";

export const CAMPAIGNS_FILE = "data/campaigns.json"; // repo-relative path (used for the GitHub commit)

const CAMPAIGNS_PATH = path.join(process.cwd(), "data", "campaigns.json");
const SITE_PATH = path.join(process.cwd(), "data", "site.json");
function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

/** Raw list, as stored (used by the admin panel). */
export function getAllCampaigns(): Campaign[] {
  return readJson<Campaign[]>(CAMPAIGNS_PATH);
}

/** What visitors see: hidden and policy-blocked campaigns are dropped. */
export function getPublicCampaigns(): Campaign[] {
  return getAllCampaigns().filter((c) => c.visible !== false && !isBlocked(c));
}

export function getSiteSettings(): SiteSettings {
  return readJson<SiteSettings>(SITE_PATH);
}
