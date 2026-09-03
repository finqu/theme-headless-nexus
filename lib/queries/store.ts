/**
 * Store Queries
 *
 * Queries for store configuration, locales, and currencies.
 * These are typically fetched once and cached for long periods.
 *
 * Types are imported from @finqu/storefront-types.
 */

import type { Locale, Currency, StoreInfo } from '@finqu/storefront-types';

/**
 * Query for store information
 */
export const STORE_QUERY = /* GraphQL */ `
  query Store {
    store {
      name
      logo
      favicon
      customerAccountsEnabled
    }
  }
`;

/**
 * Subset of StoreInfo containing only the fields we query
 */
export type StoreBasicInfo = Pick<
  StoreInfo,
  'name' | 'logo' | 'favicon' | 'customerAccountsEnabled'
>;

export interface StoreQueryResponse {
  store: StoreBasicInfo | null;
}

/**
 * Query for available locales in the store
 */
export const LOCALES_QUERY = /* GraphQL */ `
  query Locales {
    locales {
      isoCode
      endonymName
      name
      primary
      rootUrl
    }
  }
`;

export interface LocalesQueryResponse {
  locales: Locale[];
}

/**
 * Query for available currencies in the store
 */
export const CURRENCIES_QUERY = /* GraphQL */ `
  query Currencies {
    currencies {
      isoCode
      name
      symbol
    }
  }
`;

export interface CurrenciesQueryResponse {
  currencies: Currency[];
}

/**
 * Combined query for store setup (store info + locales)
 * Use for initial app bootstrap
 */
export const STORE_SETUP_QUERY = /* GraphQL */ `
  query StoreSetup {
    store {
      name
      logo
    }
    locales {
      isoCode
      endonymName
      name
      primary
      rootUrl
    }
  }
`;

export interface StoreSetupQueryResponse {
  store: Pick<StoreInfo, 'name' | 'logo'> | null;
  locales: Locale[];
}
