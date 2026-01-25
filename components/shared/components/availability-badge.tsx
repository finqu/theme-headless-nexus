import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  /** Whether the product is available */
  isAvailable: boolean;
  /** Display variant */
  variant?: 'dot' | 'text' | 'badge';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable availability indicator component
 * Shows product availability status with consistent styling
 */
export function AvailabilityBadge({
  isAvailable,
  variant = 'text',
  className,
}: AvailabilityBadgeProps) {
  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            isAvailable ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-sm text-gray-600">
          {isAvailable ? 'In stock' : 'Out of stock'}
        </span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          isAvailable
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800',
          className
        )}
      >
        {isAvailable ? 'In Stock' : 'Out of Stock'}
      </span>
    );
  }

  // Default: text variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isAvailable ? 'bg-green-500' : 'bg-red-500'
        )}
      />
      <span className="text-sm text-gray-600">
        {isAvailable ? 'In stock' : 'Out of stock'}
      </span>
    </div>
  );
}
