import type { Metadata } from "next";
import { Outfit, Nunito } from "next/font/google";
import Providers from "@/components/Providers";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "SOLO — AI-Powered Business Platform for Nigerian & African SMEs | Free Store",
  description: "SOLO gives Nigerian SMEs a digital storefront, smart POS, AI marketing, and financial ledger in one platform. Start free. No coding. Launch in 30 minutes.",
  keywords: [
    "SME platform Nigeria",
    "digital storefront Nigeria",
    "POS system Nigeria",
    "African SME software",
    "small business Nigeria",
    "online store Nigeria",
    "Katsina startup",
    "AI business platform Africa",
  ],
  metadataBase: new URL('https://solo-sme.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SOLO SME Platform — Run Your Nigerian Business From One Place",
    description: "Free digital storefront + POS + AI marketing for African small businesses. Powered by Supabase & Gemini AI.",
    url: 'https://solo-sme.vercel.app',
    siteName: 'SOLO SME',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SOLO — AI Business Platform for African SMEs",
    description: "Start your free Nigerian business store in 30 minutes.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

import { Suspense } from 'react';
import LoadingBar from "@/components/ui/LoadingBar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Analytics from "@/components/landing/Analytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${outfit.variable} ${nunito.variable} noise-bg`}>
        <ToastProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          <Providers>
            {children}
          </Providers>
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
