'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Alternate URL for a different locale
 */
export interface Alternate {
  /** Language code (e.g., 'en', 'fi', 'sv', 'x-default') */
  hreflang: string;
  /** URL path for this locale (e.g., '/fi/tuotteet') */
  path: string;
  /** Full URL for this locale */
  url: string;
}

/**
 * Context value for alternates
 */
interface AlternatesContextValue {
  alternates: Alternate[];
}

const AlternatesContext = createContext<AlternatesContextValue | null>(null);

/**
 * Provider for alternate locale URLs.
 * Wraps page content to provide locale-specific URLs to the locale switcher.
 *
 * @example
 * ```tsx
 * // In a page component
 * const resource = await getResourceByPath(path, locale);
 *
 * return (
 *   <AlternatesProvider alternates={resource.alternates || []}>
 *     <SiteLayout locale={locale}>
 *       <Content />
 *     </SiteLayout>
 *   </AlternatesProvider>
 * );
 * ```
 */
export function AlternatesProvider({
  alternates,
  children,
}: {
  alternates: Alternate[];
  children: ReactNode;
}) {
  return <AlternatesContext.Provider value={{ alternates }}>{children}</AlternatesContext.Provider>;
}

/**
 * Hook to access alternate locale URLs.
 * Returns empty array if used outside of AlternatesProvider.
 *
 * @example
 * ```tsx
 * function LocaleSwitcher() {
 *   const { alternates } = useAlternates();
 *
 *   return (
 *     <select>
 *       {alternates.map((alt) => (
 *         <option key={alt.hreflang} value={alt.path}>
 *           {alt.hreflang}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useAlternates(): AlternatesContextValue {
  const context = useContext(AlternatesContext);
  return context || { alternates: [] };
}
