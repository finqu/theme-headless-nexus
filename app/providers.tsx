'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { LocaleProvider } from '@/lib/locale-context';

interface ProvidersProps {
  children: ReactNode;
  /** Current locale code from middleware headers */
  locale: string;
  /** Default locale code (first available from store) */
  defaultLocale: string;
}

/**
 * Application providers wrapper
 * Sets up React Query for data fetching/caching and locale context
 *
 * Note: StorefrontProvider can be added here when client-side
 * storefront hooks are needed
 */
export function Providers({ children, locale, defaultLocale }: ProvidersProps) {
  // Create a new QueryClient for each session to avoid shared state
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Good defaults for a storefront
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={locale} defaultLocale={defaultLocale}>
        {children}
      </LocaleProvider>
    </QueryClientProvider>
  );
}
