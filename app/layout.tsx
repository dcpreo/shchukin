import type { Metadata } from "next";
import { EB_Garamond, Archivo } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const serif = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif"
});

const sans = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shchukin.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shchukin Collection Archive — Shchukin Foundation",
    template: "%s · Shchukin Collection Archive"
  },
  description:
    "A scholarly, provenance-sensitive archive of the Shchukin family collections: Sergei Shchukin's 259-work French modernism collection (Hermitage & Pushkin), the four historic brothers, and the modern Gallery SHCHUKIN chapter.",
  keywords: [
    "Shchukin Foundation",
    "Shchukin Collection Archive",
    "Sergei Shchukin",
    "Shchukin family collections",
    "Gallery SHCHUKIN",
    "Nikolai Shchukin",
    "Russian avant-garde collection",
    "French modernism collection",
    "provenance archive",
    "Hermitage",
    "Pushkin Museum"
  ],
  authors: [{ name: "Kunst Gruppe Bureau / Shchukin Foundation" }],
  openGraph: {
    type: "website",
    title: "Shchukin Collection Archive",
    description:
      "A dynasty of collectors, archives, and institutions from 1818 to the present — documented public record, distinguished from family-held memory and estate material.",
    siteName: "Shchukin Collection Archive"
  },
  robots: { index: true, follow: true },
  twitter: { card: "summary_large_image", title: "Shchukin Collection Archive" }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-oxblood focus:px-3 focus:py-2 focus:font-sans focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
