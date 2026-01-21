'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createStorefrontClient } from '@finqu/storefront-lib';
import { useLocale } from '@/lib/locale-context';
import type { Locale } from '@/lib/store-cache';

const PATH_BY_LOCALE_QUERY = `
  query PathByLocale($path: String!, $locale: String!) {
    pathByLocale(path: $path, locale: $locale)
  }
`;

interface PathByLocaleResponse {
  pathByLocale: string;
}

interface LocaleSwitcherProps {
  locales: Locale[];
  isEditing?: boolean;
}

/**
 * Client component that allows users to switch between available locales
 * Uses pathByLocale query to map the current path to equivalent paths in other locales
 */
export function LocaleSwitcher({ locales, isEditing = false }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { defaultLocale } = useLocale();

  // Determine current locale from pathname
  // Pathname includes locale prefix for non-default locales (e.g., /fi/ostoskori)
  // For default locale, pathname has no prefix (e.g., /ostoskori)
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0]?.toLowerCase();
  
  // Check if first segment matches a locale code (and is not the default)
  const matchedLocale = locales.find(
    (l) => l.isoCode.toLowerCase() === firstSegment && l.isoCode !== defaultLocale
  );
  
  // Current locale is either the matched locale or the default
  const currentLocale = matchedLocale?.isoCode || defaultLocale;

  // Create storefront client for GraphQL queries
  const client = useMemo(
    () =>
      createStorefrontClient({
        baseUrl: process.env.NEXT_PUBLIC_FINQU_STOREFRONT_URL!,
        token: process.env.NEXT_PUBLIC_FINQU_STOREFRONT_TOKEN,
      }),
    []
  );

  // Fetch path for each locale in parallel
  const localePaths = useQuery({
    queryKey: ['locale-paths', pathname, locales.map((l) => l.isoCode)],
    queryFn: async () => {
      const paths: Record<string, string> = {};

      // Fetch paths for all locales in parallel
      const pathPromises = locales.map(async (locale) => {
        try {
          const response = await client.execute<PathByLocaleResponse>(PATH_BY_LOCALE_QUERY, {
            path: pathname,
            locale: locale.isoCode,
          });
          return { locale: locale.isoCode, path: response.pathByLocale || '/' };
        } catch (error) {
          console.error(`Failed to fetch path for locale ${locale.isoCode}:`, error);
          // Fallback to root path for that locale
          return { locale: locale.isoCode, path: locale.rootUrl || '/' };
        }
      });

      const results = await Promise.all(pathPromises);
      results.forEach(({ locale, path }) => {
        paths[locale] = path;
      });

      return paths;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !isEditing && locales.length > 0,
  });

  // Handle locale change
  const handleLocaleChange = (newLocale: string) => {
    if (isEditing) return;

    const targetPath = localePaths.data?.[newLocale] || '/';
    router.push(targetPath);
  };

  // Don't render if only one locale or in editing mode
  if (locales.length <= 1 || isEditing) {
    return null;
  }

  // Find current locale info
  const currentLocaleInfo = locales.find((l) => l.isoCode === currentLocale);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-select" className="sr-only">
        Select language
      </label>
      <select
        id="locale-select"
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        disabled={localePaths.isLoading || isEditing}
        className="text-muted-foreground bg-transparent border border-muted-foreground/20 rounded px-2 py-1 text-sm hover:border-muted-foreground/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale.isoCode} value={locale.isoCode}>
            {locale.endonymName || locale.name || locale.isoCode.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
