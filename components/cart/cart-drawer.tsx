'use client';

import { ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
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

function formatPrice(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

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

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-4">
              <CartLineItemSkeleton />
              <CartLineItemSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-2 text-sm text-gray-500">
                Looks like you haven&apos;t added anything yet.
              </p>
              <SheetClose asChild>
                <Button asChild className="mt-6">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
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
