/**
 * Price formatting and calculation utilities
 */

/**
 * Formats a price value as currency
 * @param value - The price value to format
 * @param currency - The currency code (default: 'EUR')
 * @returns Formatted price string
 */
export function formatPrice(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Calculates the discount percentage between original and sale price
 * @param originalPrice - The original price
 * @param price - The current/sale price
 * @returns Discount percentage (0-100)
 */
export function calculateDiscountPercent(
  originalPrice: number,
  price: number
): number {
  if (originalPrice <= 0 || price <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Checks if a product is on sale
 * @param originalPrice - The original price (may be null/undefined)
 * @param price - The current price (may be null/undefined)
 * @returns True if the product is on sale
 */
export function isOnSale(
  originalPrice: number | null | undefined,
  price: number | null | undefined
): boolean {
  if (!originalPrice || !price) return false;
  return originalPrice > price;
}
