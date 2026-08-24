import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SampleDataBanner } from "@/components/SampleDataBanner";
import { StructuredData } from "@/components/StructuredData";
import { getDataset } from "@/lib/dataset";
import { SITE_NAME, SITE_URL, SITE_TAGLINE, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare and rank every Indian mutual fund by CAGR across 1, 3, 5 and 10 year horizons. NAV history, category and fund-house breakdowns, updated daily.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { meta } = getDataset();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <StructuredData data={websiteJsonLd()} />
      </head>
      <body>
        <SampleDataBanner source={meta.source} />
        <Header />
        <main>{children}</main>
        <Footer generatedAt={meta.generatedAt} />
      </body>
    </html>
  );
}
