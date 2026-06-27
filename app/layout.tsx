import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { getListings } from "@/lib/listings-server";
import { SEED } from "@/lib/data";
import type { Listing } from "@/lib/types";

export const metadata: Metadata = {
  title: "Money Multiply — The Land Bankers & Traders | Tokenised Land Marketplace",
  description:
    "A luxury land-banking and tokenised-investment marketplace. Own fractional tokens in title-clear land and Grade-A developments across the Greater Noida growth corridor.",
  icons: { icon: "/images/emblem.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0f0c",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Server-render listings from Supabase; fall back to bundled seed if the
  // backend isn't reachable yet (e.g. schema not created).
  let initialListings: Listing[] = SEED;
  try {
    initialListings = await getListings();
  } catch {
    initialListings = SEED;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=Inter:wght@300;400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MarketplaceProvider initialListings={initialListings}>{children}</MarketplaceProvider>
      </body>
    </html>
  );
}
