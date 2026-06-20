import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";

// Self-hosted via next/font (no render-blocking CDN, no layout shift).
const display = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIMONA Operations Dashboard",
  description: "SIMONA — Lagos made-to-measure operations dashboard.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SIMONA", statusBarStyle: "black" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
