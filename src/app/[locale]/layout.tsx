import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "../globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  weight: ["300", "400", "500", "600", "700", "800"],
});
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import { BottomNav } from '@/components/bottom-nav';
import { DashboardHeader } from '@/components/dashboard-header';
import { Providers } from './providers';
import SupabaseAuthListener from "@/components/SupabaseAuthListener";
import { getSettings } from "@/lib/settings";
import MarketingPixels from "@/components/marketing-pixels";
import AmbientStars from '@/components/AmbientStars';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hbservice.store'),
    title: {
      default: settings.seo_title || "HB_Service — Parfums & Soins Naturels Premium",
      template: "%s | HB_Service",
    },
    description: settings.seo_description || "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.",
    keywords: ["HB_Service", "parfum", "soins naturels", "premium", "Afrique", "parfumerie", "skincare"],
    icons: { icon: settings.logo_url || "/logo-gold.jpg" },
    openGraph: {
      title: settings.seo_title || "HB_Service — Parfums & Soins Naturels Premium",
      description: settings.seo_description || "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.",
      type: "website",
      siteName: "HB_Service",
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo_title || "HB_Service — Parfums & Soins Naturels Premium",
    },
    alternates: {
      canonical: '/',
      languages: {
        'fr': '/fr',
        'en': '/en',
      },
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params?.locale || 'fr';
  const { children } = props;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const settings = await getSettings();

  return (
    <html lang={locale} suppressHydrationWarning className={`${hankenGrotesk.variable}`}>
      <body className="antialiased bg-surface-main text-on-background font-sans overflow-hidden h-screen w-full flex flex-col">
        <AmbientStars />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex-1 flex flex-col h-screen overflow-hidden pb-16">
               <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <DashboardHeader />
                  <main className="max-w-7xl mx-auto w-full relative z-10">
                    <SupabaseAuthListener />
                    {children}
                  </main>
               </div>
            </div>
            <BottomNav />
            <Toaster position="top-right" richColors />
            <MarketingPixels settings={settings} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
