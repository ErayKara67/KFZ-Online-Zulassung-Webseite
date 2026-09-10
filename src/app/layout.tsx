import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";

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
    default: `${brand.name} — Zulassungsservice`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Wunschkennzeichen prüfen und reservieren, Fahrzeug online zulassen, ummelden oder abmelden. Alle amtlichen Gebühren inklusive, Kennzeichen kommen per Versand.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1014",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      /* Markenfarbe aus brand.ts – ein Wechsel ist eine Änderung an einer Datei */
      style={
        {
          "--color-accent": brand.accent.base,
          "--color-accent-bright": brand.accent.bright,
          "--color-accent-deep": brand.accent.deep,
        } as React.CSSProperties
      }
    >
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
