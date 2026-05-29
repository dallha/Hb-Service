import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HB_Service — Parfums & Soins Naturels Premium",
  description:
    "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels. Parfums premium et soins naturels.",
  keywords: [
    "HB_Service",
    "parfum",
    "soins naturels",
    "premium",
    "Afrique",
    "parfumerie",
    "skincare",
  ],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "HB_Service — Parfums & Soins Naturels Premium",
    description:
      "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <Script src="/scripts/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
