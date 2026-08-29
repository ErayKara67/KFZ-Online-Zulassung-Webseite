import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

/**
 * Schrift: Es wird bewusst der System-Font-Stack verwendet (schnell, kein
 * externer Request, DSGVO-unkritisch). Wenn Sie stattdessen Inter einsetzen
 * möchten, ergänzen Sie:
 *
 *   import { Inter } from "next/font/google";
 *   const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
 *
 * und hängen Sie `inter.variable` an die className des <html>-Elements.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.claim}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Wunschkennzeichen prüfen und reservieren, Fahrzeug online zulassen, ummelden oder abmelden. Alle amtlichen Gebühren inklusive, Kennzeichen kommen per Versand.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: site.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2e5b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="min-h-dvh antialiased">
        <a href="#inhalt" className="skip-link">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="inhalt">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
