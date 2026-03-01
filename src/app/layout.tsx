import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SOLO | The Intelligent Operating System for SMEs",
  description: "Automate your growth with the world's most advanced SME business brain.",
  metadataBase: new URL('https://solo-sme.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SOLO | The Intelligent Operating System for SMEs",
    description: "Automate your growth with the world's most advanced SME business brain.",
    url: 'https://solo-sme.vercel.app',
    siteName: 'SOLO SME',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SOLO | The Intelligent Operating System for SMEs",
    description: "Automate your growth with the world's most advanced SME business brain.",
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
    <html lang="en">
      <body className={`${outfit.variable} noise-bg`}>
        {children}
      </body>
    </html>
  );
}
