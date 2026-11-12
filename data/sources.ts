import type { Source } from "./types";

/** Reusable source links. Add a new one here, then reference it in a listing as SRC.yourKey. */
export const SRC = {
  ticker: { t: "Cryptoticker: airdrops week 45 (Nov 2, 2026)", u: "https://cryptoticker.io/en/crypto-airdrops-week-45-2026-deadlines/" },
  farm: { t: "Farmdash: upcoming airdrops Q4 2026", u: "https://www.farmdash.one/guides/upcoming-crypto-airdrops-q4-2026" },
  standx: { t: "Coinranking: StandX DUSD claims", u: "https://coinranking.com/news/standx-opens-dusd-airdrop-claims-until-december-31-cancels" },
  bitrue: { t: "Bitrue: Primus Labs airdrop guide", u: "https://www.bitrue.com/blog/primus-labs-airdrop-guide-claim" },
  alert: { t: "AirdropAlert: Primus Labs", u: "https://airdropalert.com/?p=304396" },
  coinlaunch: { t: "CoinLaunch: Primus Labs retrodrop overview", u: "https://coinlaunch.space/events-contests/primus-labs-retrodrop/" },
  cryptorank: { t: "CryptoRank: Primus Labs (prev. PADO) activity", u: "https://cryptorank.io/drophunting/pado-labs-activity698" },
  polyester: { t: "AirdropAlert: Polyester testnet", u: "https://airdropalert.com/airdrops/polyester-testnet/" },
} satisfies Record<string, Source>;
