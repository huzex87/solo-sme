import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Providers from "@/components/Providers";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SOLO | The All-in-One Platform for Small Businesses",
  description: "Everything your business needs to sell online — store, payments, inventory, and AI assistant.",
  metadataBase: new URL('https://solo-sme.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SOLO | The All-in-One Platform for Small Businesses",
    description: "Everything your business needs to sell online — store, payments, inventory, and AI assistant.",
    url: 'https://solo-sme.vercel.app',
    siteName: 'SOLO SME',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SOLO | The All-in-One Platform for Small Businesses",
    description: "Everything your business needs to sell online — store, payments, inventory, and AI assistant.",
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} noise-bg`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
