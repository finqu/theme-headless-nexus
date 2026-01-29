import type { Metadata } from 'next';
import { getLocaleInfo } from '@/lib/locale';
import { Providers } from './providers';
import { Outfit, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'theme-headless-nexus',
  description: 'Finqu Storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get locale info from middleware headers (single source of truth)
  const { locale, defaultLocale } = await getLocaleInfo();

  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Providers locale={locale} defaultLocale={defaultLocale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
