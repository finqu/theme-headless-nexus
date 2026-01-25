import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Optional icon to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button/link */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable empty state component
 * Used for empty carts, product lists, search results, etc.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center text-center',
        className
      )}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
