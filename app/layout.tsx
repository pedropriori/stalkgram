import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UtmifyUtmsScript } from "./components/utmify-utms-script";
import { UtmifyPixel } from "./components/utmify-pixel";
import { ClarityScript } from "./components/clarity-script";
import { LoadingProviderWrapper } from "./components/loading-provider-wrapper";
import { UtmifyLinkProtection } from "./components/utmify-link-protection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram Scraper",
  description:
    "Scraping leve: dados públicos do perfil e amostra de 10 seguidos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UtmifyUtmsScript />
        <UtmifyPixel />
        <ClarityScript />
        <UtmifyLinkProtection />
        <LoadingProviderWrapper>{children}</LoadingProviderWrapper>
      </body>
    </html>
  );
}
