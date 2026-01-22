/**
 * Store Queries
 *
 * Queries for store configuration, locales, and currencies.
 * These are typically fetched once and cached for long periods.
 */

import type { Locale, Currency, StoreInfo } from '@finqu/storefront-types';

/**
 * Query for store information and available locales
 */
export const STORE_QUERY = /* GraphQL */ `
  query Store {
    store {
      name
      description
      email
      phone
      logo
      favicon
      address
      city
      zip
      country
      countryCode
    }
  }
`;

export interface StoreQueryResponse {
    store: StoreInfo | null;
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
      symbolFirst
      decimalMark
      thousandsSeparator
      active
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
