import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SPRITE } from "@/lib/sprite";
import { SITE_URL } from "@/data/site";

const description =
  "See which airdrops are open right now, which are only points programs, and which are just rumors. Every card shows its deadline and sources, and a link scanner checks suspicious claim links.";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: { default: "DropShield: find real airdrops, avoid the scams", template: "%s | DropShield" },
  description,
  openGraph: { title: "DropShield", description, type: "website", siteName: "DropShield" },
  twitter: { card: "summary", title: "DropShield", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ebebe5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
        {children}
      </body>
    </html>
  );
}
