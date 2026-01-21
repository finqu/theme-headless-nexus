import type { Metadata } from 'next';
import { getStoreInfo } from '@/lib/store-cache';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'theme-headless-horizon',
  description: 'Finqu Storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get locale from store API - this is the default for the root layout
  // Individual pages will determine their specific locale from URL
  const storeInfo = await getStoreInfo();
  const defaultLocale = storeInfo.defaultLocale;

  return (
    <html lang={defaultLocale}>
      <body>
        <Providers locale={defaultLocale} defaultLocale={defaultLocale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
