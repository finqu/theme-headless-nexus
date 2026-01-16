'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Application providers wrapper
 * Sets up React Query for data fetching/caching
 *
 * Note: StorefrontProvider can be added here when client-side
 * storefront hooks are needed
 */
export function Providers({ children }: { children: ReactNode }) {
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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
