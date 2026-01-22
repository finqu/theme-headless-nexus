'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  /** Show as text button with label instead of icon only */
  showLabel?: boolean;
}

export function CartIcon({ className, showLabel }: CartIconProps) {
  const { itemCount, openCart, isLoading } = useCart();

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      className={cn('relative', className)}
      onClick={openCart}
      aria-label={`Cart with ${itemCount} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {showLabel && <span className="ml-2">Cart</span>}
      {!isLoading && itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}
