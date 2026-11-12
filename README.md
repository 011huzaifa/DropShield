# DropShield

DropShield labels each airdrop campaign by what the project has actually announced, shows where the information comes from, and checks suspicious links before you open them.

Built with Next.js (App Router) and TypeScript.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Deploy on Vercel: import this repo, no settings needed.

## Edit the airdrop list (no code needed)

Everything lives in `data/`:

| File | What it controls |
| --- | --- |
| `data/listings.ts` | The airdrop list. Add, edit or remove campaigns here. A copy-paste template is at the top of the file. |
| `data/sources.ts` | Reusable source links. Add one, then use it as `SRC.yourKey` in a listing. |
| `data/site.ts` | "Last checked" date, social links (footer icons appear only when a link is filled in), site URL. |

**Add a listing:** copy the template in `data/listings.ts`, paste it into `LISTINGS`, fill it in.

**Use your referral link:** on a listing, set `referralUrl: "https://project.xyz/?ref=YOURCODE"`. An "Open official page" button appears in the listing, labelled as a referral link. Leave it `null` for no button.

**After any change:** update `LAST_CHECKED` in `data/site.ts`, commit and push. Vercel redeploys on its own.

An `open` listing with a deadline turns into "Closed" by itself once the deadline passes.

## Rules for listings

- Only list a campaign when you can cite a source for what you say about it.
- Use the label the evidence supports: `open`, `points`, `unconfirmed` or `ended`.
- Show official addresses as plain text. Do not link to claim pages.
- Never promise rewards, and never ask visitors to connect a wallet.
