import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SampleDataBanner } from "@/components/SampleDataBanner";
import { StructuredData } from "@/components/StructuredData";
import { getDataset } from "@/lib/dataset";
import { SITE_NAME, SITE_URL, SITE_TAGLINE, websiteJsonLd, organizationJsonLd } from "@/lib/seo";

// Self-hosted, preloaded, swap — removes the render-blocking Google Fonts request.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare and rank every Indian mutual fund by CAGR across 1, 3, 5 and 10 year horizons. NAV history, category and fund-house breakdowns, updated daily.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "finance",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_IN",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Rank and compare every Indian mutual fund by CAGR across 1, 3, 5 and 10 year horizons. Updated daily.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Rank and compare every Indian mutual fund by CAGR across 1, 3, 5 and 10 year horizons.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// GA4 loads only in production and only when a Measurement ID is configured, so local
// dev and preview builds never send hits and no broken tag is injected when it's unset.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const gaEnabled = !!GA_ID && process.env.NODE_ENV === "production";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { meta } = getDataset();
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        <StructuredData data={[websiteJsonLd(), organizationJsonLd()]} />
      </head>
      <body>
        {/* Bypass block: lets keyboard users skip the header nav + search on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-white"
        >
          Skip to main content
        </a>
        <SampleDataBanner source={meta.source} />
        <Header />
        <main id="main">{children}</main>
        <Footer generatedAt={meta.generatedAt} />
      </body>
      {gaEnabled && <GoogleAnalytics gaId={GA_ID as string} />}
    </html>
  );
}
