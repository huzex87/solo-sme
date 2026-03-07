import type { Metadata } from "next";
import { Outfit, DM_Mono, Fraunces } from "next/font/google";
import Providers from "@/components/Providers";
import "@/styles/globals.css";
import { Suspense } from 'react';
import LoadingBar from "@/components/ui/LoadingBar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Analytics from "@/components/landing/Analytics";
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-outfit",
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ['400', '500'],
  variable: "--font-dm-mono",
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: "--font-fraunces",
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#00798C',
};

export const metadata: Metadata = {
  title: {
    default: "SOLO — AI-Powered Business Platform for Nigerian & African SMEs",
    template: "%s | SOLO SME"
  },
  description: "SOLO gives Nigerian SMEs a digital storefront, smart POS, AI marketing, and financial ledger in one platform. Start free. Launch in 30 minutes.",
  keywords: [
    "SME platform Nigeria",
    "digital storefront Lagos",
    "POS system Abuja",
    "African SME software",
    "small business Nigeria",
    "online store Katsina",
    "inventory management Africa",
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
    creator: '@solosme',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SOLO SME',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${outfit.variable} ${dmMono.variable} ${fraunces.variable} font-sans bg-surface text-body`}>
        <ToastProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          <Providers>
            {children}
          </Providers>
          <Analytics />
        </ToastProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
          }}
        />
      </body>
    </html>
  );
}
