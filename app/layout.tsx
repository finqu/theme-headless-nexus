import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'theme-headless-horizon',
  description: 'Finqu Storefront',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale from headers set by middleware
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';
  const defaultLocale = headersList.get('x-default-locale') || 'en';

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
