/**
 * Custom GraphQL Queries
 *
 * This module contains GraphQL queries for operations not covered by the SDK's
 * built-in helper functions. Each query file exports:
 * - The query as a template string
 * - TypeScript response interfaces
 *
 * These queries use the SDK's fragments where applicable and are typed
 * to work with @finqu/storefront-types.
 */

export * from './store';
export * from './navigation';
export * from './routing';
export * from './content';
