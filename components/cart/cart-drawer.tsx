'use client';

import { ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/context-providers/cart-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { CartLineItem, CartLineItemSkeleton } from './cart-line-item';
import { formatPrice, EmptyState } from '@/components/shared';

interface CartDrawerProps {
  /** Optional cart page URL for "View cart" link */
  cartUrl?: string;
}

export function CartDrawer({ cartUrl = '/cart' }: CartDrawerProps) {
  const {
    cart,
    items,
    itemCount,
    isLoading,
    isUpdating,
    isOpen,
    closeCart,
    updateItem,
    removeItem,
    error,
    clearError,
    checkoutUrl,
  } = useCart();

  const currency = cart?.currency ?? 'EUR';
  const subtotal = cart?.subtotalPrice ?? 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Cart {itemCount > 0 && `(${itemCount})`}
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

        {error ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <span className="flex-1">{error}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="-mt-1 -mr-1 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={clearError}
              aria-label="Dismiss cart error"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-4">
              <CartLineItemSkeleton />
              <CartLineItemSkeleton />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-12 w-12 text-gray-300" />}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet."
              action={
                <SheetClose asChild>
                  <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </SheetClose>
              }
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateItem}
                  onRemove={removeItem}
                  isUpdating={isUpdating}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal and Checkout */}
        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="flex-col gap-4 pt-4 sm:flex-col">
              {/* Subtotal */}
              <div className="flex w-full items-center justify-between">
                <span className="text-base font-medium text-gray-900">Subtotal</span>
                <span className="text-base font-medium text-gray-900">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>

              {/* Checkout Button */}
              {checkoutUrl ? (
                <Button asChild className="w-full" size="lg">
                  <a href={checkoutUrl}>Checkout</a>
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Checkout
                </Button>
              )}

              {/* View Cart Link */}
              <SheetClose asChild>
                <Button variant="outline" asChild className="w-full">
                  <Link href={cartUrl}>View Cart</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
