'use client';

import { type ReactNode } from 'react';
import { FinquProvider } from '@finqu/storefront-sdk/react';
import { LocaleProvider } from '@/lib/context-providers/locale-context';
import { CartProvider } from '@/lib/context-providers/cart-context';

interface ProvidersProps {
  children: ReactNode;
  /** Current locale code from middleware headers */
  locale: string;
  /** Default locale code (first available from store) */
  defaultLocale: string;
}

/**
 * Application providers wrapper
 * Sets up Finqu SDK provider, locale context, and cart state
 *
 * Note: AlternatesProvider is added by individual pages since alternates
 * are page-specific data from resourceByPath API.
 */
export function Providers({ children, locale, defaultLocale }: ProvidersProps) {
  return (
    <FinquProvider
      publicKey={process.env.NEXT_PUBLIC_FINQU_PUBLIC_KEY!}
      endpoint={process.env.NEXT_PUBLIC_FINQU_STOREFRONT_URL!}
    >
      <LocaleProvider locale={locale} defaultLocale={defaultLocale}>
        <CartProvider>{children}</CartProvider>
      </LocaleProvider>
    </FinquProvider>
  );
}
