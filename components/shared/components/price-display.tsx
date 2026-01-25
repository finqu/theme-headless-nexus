import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscountPercent, isOnSale } from '../utils/price';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  /** Current price */
  price: number | null | undefined;
  /** Original price (for sale items) */
  originalPrice?: number | null | undefined;
  /** Currency code */
  currency?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show discount badge */
  showDiscount?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
};

/**
 * Reusable price display component with sale indicators
 * Handles regular prices, sale prices with strikethrough, and discount badges
 */
export function PriceDisplay({
  price,
  originalPrice,
  currency = 'EUR',
  size = 'md',
  showDiscount = false,
  className,
}: PriceDisplayProps) {
  if (price == null) return null;

  const onSale = isOnSale(originalPrice, price);
  const discountPercent = onSale && originalPrice
    ? calculateDiscountPercent(originalPrice, price)
    : 0;

  return (
    <div className={cn('flex items-baseline gap-3', className)}>
      {showDiscount && onSale && (
        <Badge variant="destructive" className="uppercase">
          Sale {discountPercent}% off
        </Badge>
      )}
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            'font-semibold',
            sizeClasses[size],
            onSale ? 'text-red-600' : 'text-gray-900'
          )}
        >
          {formatPrice(price, currency)}
        </span>
        {onSale && originalPrice && (
          <span className={cn('text-gray-500 line-through', size === 'lg' ? 'text-lg' : 'text-base')}>
            {formatPrice(originalPrice, currency)}
          </span>
        )}
      </div>
    </div>
  );
}
