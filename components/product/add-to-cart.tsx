'use client';

import { useState } from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/context-providers/cart-context';
import { cn } from '@/lib/utils';

interface AddToCartProps {
  productId?: number;
  isAvailable?: boolean;
  className?: string;
}

export function AddToCart({ productId, isAvailable = true, className }: AddToCartProps) {
  const { addItem, isUpdating } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (productId == null || !isAvailable) return;

    setIsAdding(true);
    try {
      await addItem(productId, quantity);
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const isLoading = isAdding || isUpdating;
  const isDisabled = productId == null || !isAvailable || isLoading;

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row', className)}>
      {/* Quantity Selector */}
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || isLoading}
          className="h-10 w-10 rounded-l rounded-r-none"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-16 items-center justify-center border-y border-gray-200 bg-white text-center">
          <span className="text-sm font-medium">{quantity}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increaseQuantity}
          disabled={isLoading}
          className="h-10 w-10 rounded-l-none rounded-r"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button onClick={handleAddToCart} disabled={isDisabled} size="lg" className="flex-1">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : !isAvailable ? (
          'Out of Stock'
        ) : (
          'Add to Cart'
        )}
      </Button>
    </div>
  );
}
