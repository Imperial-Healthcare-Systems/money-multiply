import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MarketplaceProvider } from "@/context/MarketplaceContext";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <MarketplaceProvider>{children}</MarketplaceProvider>
      </body>
    </html>
  );
}
