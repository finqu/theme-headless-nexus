import type { Metadata } from 'next';
import { getLocaleInfo } from '@/lib/locale';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'theme-headless-horizon',
  description: 'Finqu Storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get locale info from middleware headers (single source of truth)
  const { locale, defaultLocale } = await getLocaleInfo();

  return (
    <html lang={locale}>
      <body>
        <Providers locale={locale} defaultLocale={defaultLocale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
