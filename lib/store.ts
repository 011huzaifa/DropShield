import fs from "node:fs/promises";
import path from "node:path";
import type { Campaign } from "./types";
import { CAMPAIGNS_FILE } from "./campaigns";

/**
 * Saves the campaign list.
 *  - If GITHUB_TOKEN + GITHUB_REPO are set: commits data/campaigns.json to your repo
 *    (your host, e.g. Vercel, redeploys automatically and the change goes live in ~1 minute).
 *  - Otherwise: writes the file on disk (works in `npm run dev` on your own computer).
 */
export async function saveCampaigns(list: Campaign[]): Promise<{ mode: "github" | "local"; note: string }> {
  const content = JSON.stringify(list, null, 2) + "\n";
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  if (token && repo) {
    const branch = process.env.GITHUB_BRANCH || "main";
    const api = `https://api.github.com/repos/${repo}/contents/${CAMPAIGNS_FILE}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "dropshield-admin",
    };
    const cur = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
    let sha: string | undefined;
    if (cur.ok) sha = (await cur.json()).sha;
    else if (cur.status !== 404) throw new Error(`GitHub read failed (${cur.status}). Check GITHUB_TOKEN, GITHUB_REPO and GITHUB_BRANCH.`);
    const put = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update airdrop listings via admin panel",
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!put.ok) throw new Error(`GitHub save failed (${put.status}). The token needs "Contents: Read and write" on this repo.`);
    return { mode: "github", note: "Saved to GitHub. Your site will redeploy and show the change in about a minute." };
  }
  if (process.env.VERCEL) {
    throw new Error("Saving is not set up yet. Add GITHUB_TOKEN and GITHUB_REPO in your host's environment variables (see README).");
  }
  await fs.writeFile(path.join(process.cwd(), "data", "campaigns.json"), content, "utf8");
  return { mode: "local", note: "Saved to data/campaigns.json on this computer. Commit and push it to publish." };
}
