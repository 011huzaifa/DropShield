# DropShield (Next.js)

Same design as the HTML prototype, rebuilt with Next.js (App Router, TypeScript). Listings live in one file, `data/campaigns.json`, and you can manage them from `/admin`.

## Run locally
```bash
npm install
cp .env.example .env.local     # set ADMIN_PASSWORD
npm run dev                    # http://localhost:3000   admin: /admin
```

## Add or edit campaigns
**Option A: admin panel (easiest).** Open `/admin`, log in, click "+ New campaign" or pick one on the left. Fields include status, deadline, summary, flags, checklist, sources, **referral link** and **official address**. Click "Save changes".

**Option B: edit the file.** Change `data/campaigns.json`, commit, push.

Other site settings (last checked date, social links) are in `data/site.json`.

### Making admin saves go live on the hosted site
Hosts like Vercel cannot write files, so the admin panel saves by committing `data/campaigns.json` to your GitHub repo; the host then redeploys (about a minute).

1. GitHub: Settings, Developer settings, Fine-grained tokens. Create a token for **only this repo** with **Contents: Read and write**.
2. In Vercel (or your host) add environment variables: `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO` (`owner/name`), `GITHUB_BRANCH` (default `main`).
3. Redeploy once. Now `/admin` saves go straight to GitHub.

Without `GITHUB_TOKEN`, saving works only on your own computer (`npm run dev`), where it writes the file locally.

## Content policy (built in)
Campaigns in these categories are never shown and cannot be saved: prediction markets, gambling/casino/betting, interest-based lending and yield (riba), leveraged derivatives, adult content, abusive/hateful content. A word filter also rejects listings whose text contains blocked words. Edit the lists in `lib/policy.ts`.

## Referral links
A campaign with a `referralUrl` gets an "Open referral link" button inside its details window, with a clear disclosure ("DropShield may earn a reward"), and a matching sentence appears in the footer. Only `https://` links are accepted.

## Push to GitHub
```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```
