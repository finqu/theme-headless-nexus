'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLineItem as CartLineItemType } from '@finqu/storefront-types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CartLineItemProps {
  item: CartLineItemType;
  onUpdateQuantity: (lineId: number, quantity: number) => void;
  onRemove: (lineId: number) => void;
  isUpdating?: boolean;
  currency?: string;
}

function formatPrice(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  currency = 'EUR',
}: CartLineItemProps) {
  // Get the id from the item - the SDK returns id as a number even though types may not reflect it
  const lineId = (item as { id?: number }).id;
  const quantity = item.quantity ?? 1;

  if (lineId == null) return null;

  return (
    <div
      className={cn(
        'flex gap-4 py-4 transition-opacity',
        isUpdating && 'pointer-events-none opacity-50'
      )}
    >
      {/* Product Image */}
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title || 'Product'}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
          {item.attributesLabel && (
            <p className="mt-0.5 text-sm text-gray-500">{item.attributesLabel}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(lineId, quantity - 1)}
              disabled={isUpdating}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(lineId, quantity + 1)}
              disabled={isUpdating}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-sm font-medium text-gray-900">
            {item.linePrice != null && formatPrice(item.linePrice, currency)}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-gray-600"
        onClick={() => onRemove(lineId)}
        disabled={isUpdating}
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CartLineItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="h-24 w-20 flex-shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
