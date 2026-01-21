'use client';

import { useLocale } from '@/lib/locale-context';
import { useAlternates } from '@/lib/alternates-context';
import type { Locale } from '@/lib/store-cache';

interface LocaleSwitcherProps {
  locales: Locale[];
  isEditing?: boolean;
}

/**
 * Client component that allows users to switch between available locales
 * Uses alternates from page context for translated URLs
 *
 * NOTE: Uses hard navigation (window.location) instead of router.push()
 * because the locale context is in the root layout which doesn't re-render
 * on client-side navigation.
 */
export function LocaleSwitcher({ locales, isEditing = false }: LocaleSwitcherProps) {
  const { locale: currentLocale, defaultLocale } = useLocale();
  const { alternates } = useAlternates();

  // Find the matching locale object (case-insensitive) to get the exact isoCode
  // This ensures the select value matches the option values exactly
  const matchedLocale = locales.find(
    (l) => l.isoCode.toLowerCase() === currentLocale.toLowerCase()
  );
  const normalizedCurrentLocale = matchedLocale?.isoCode || currentLocale;

  // Build a map of locale code -> path from alternates
  const localePathMap = new Map<string, string>();
  for (const alt of alternates) {
    // Skip x-default, use the actual locale codes
    if (alt.hreflang !== 'x-default') {
      localePathMap.set(alt.hreflang.toLowerCase(), alt.path);
    }
  }

  // Handle locale change - uses hard navigation to force layout re-render
  const handleLocaleChange = (newLocale: string) => {
    if (isEditing) return;

    // Get path from alternates, fallback to root for that locale
    const targetPath = localePathMap.get(newLocale.toLowerCase());

    if (targetPath) {
      // Hard navigation to re-run middleware and update root layout
      window.location.href = targetPath;
    } else {
      // Fallback: navigate to root of the locale
      const isDefault = newLocale.toLowerCase() === defaultLocale.toLowerCase();
      const localePath = isDefault ? '/' : `/${newLocale.toLowerCase()}`;
      window.location.href = localePath;
    }
  };

  // Don't render if only one locale or in editing mode
  if (locales.length <= 1 || isEditing) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-select" className="sr-only">
        Select language
      </label>
      <select
        id="locale-select"
        value={normalizedCurrentLocale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        disabled={isEditing}
        className="text-muted-foreground border-muted-foreground/20 hover:border-muted-foreground/40 cursor-pointer rounded border bg-transparent px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale.isoCode} value={locale.isoCode}>
            {locale.endonymName || locale.name}
          </option>
        ))}
      </select>
    </div>
  );
}
