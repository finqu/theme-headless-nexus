'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { CartDiscount } from '@finqu/storefront-types';
import { useCart } from '@/lib/context-providers/cart-context';
import { useLocale } from '@/lib/context-providers/locale-context';
import { useStore } from '@/lib/context-providers/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/components/empty-state';
import { formatPrice } from '@/components/shared/utils/price';
import { CartLineItem, CartLineItemSkeleton } from './cart-line-item';

interface CartPageProps {
  locale: string;
}

function getDiscountAmount(discount: CartDiscount): number {
  return discount.totalSavings ?? discount.totalAmount ?? discount.amount ?? 0;
}

export function CartPage({ locale }: CartPageProps) {
  const { defaultLocale } = useLocale();
  const { routes } = useStore();
  const {
    cart,
    items,
    itemCount,
    isLoading,
    isUpdating,
    updateItem,
    removeItem,
    applyDiscountCode,
    error,
    clearError,
    checkoutUrl,
  } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const localeRootHref =
    locale.toLowerCase() === defaultLocale.toLowerCase() ? '/' : `/${locale.toLowerCase()}`;
  const continueShoppingHref = routes?.catalogUrl || routes?.rootUrl || localeRootHref;

  if (isLoading) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8">
        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <EmptyState
          className="min-h-80 rounded-sm border border-gray-200 bg-white px-6 py-12"
          icon={<ShoppingBag className="h-12 w-12 text-gray-300" />}
          title="Your cart is empty"
          description="Add products to your cart to see them here."
          action={
            <Button asChild>
              <Link href={continueShoppingHref}>Continue shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const currency = cart?.currency ?? 'EUR';
  const subtotal = cart?.subtotalPrice ?? 0;
  const total = cart?.totalPrice ?? subtotal;
  const shipping = cart?.shippingPrice;
  const tax = cart?.totalTax;
  const discounts = cart?.discounts ?? [];
  const appliedCodes = discounts.flatMap((discount) => (discount.code ? [discount.code] : []));

  const handleDiscountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDiscountApplied(false);

    const applied = await applyDiscountCode(discountCode);
    if (applied) {
      setDiscountCode('');
      setDiscountApplied(true);
    }
  };

  return (
    <div className="mt-8">
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <section aria-labelledby="cart-items-heading" className="lg:col-span-7">
          <div className="rounded-sm border border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex items-center justify-between border-b border-gray-200 py-4">
              <h2 id="cart-items-heading" className="font-medium text-gray-900">
                Cart items
              </h2>
              <span className="text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
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
          </div>
        </section>

        <section
          aria-labelledby="cart-summary-heading"
          className="mt-8 rounded-sm border border-gray-200 bg-white px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0"
        >
          <h2 id="cart-summary-heading" className="text-lg font-medium text-gray-900">
            Order summary
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatPrice(subtotal, currency)}
              </dd>
            </div>

            {discounts.map((discount, index) => {
              const amount = getDiscountAmount(discount);
              const label = discount.code || discount.title || 'Discount';

              return (
                <div
                  key={`${label}-${index}`}
                  className="flex items-center justify-between text-green-700"
                >
                  <dt className="text-sm">{label}</dt>
                  <dd className="text-sm font-medium">
                    {amount > 0 ? `-${formatPrice(Math.abs(amount), currency)}` : 'Applied'}
                  </dd>
                </div>
              );
            })}

            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Shipping</dt>
              <dd className="text-sm font-medium text-gray-900">
                {shipping != null && shipping > 0
                  ? formatPrice(shipping, currency)
                  : 'Calculated at checkout'}
              </dd>
            </div>

            {tax != null && tax > 0 ? (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Tax</dt>
                <dd className="text-sm font-medium text-gray-900">{formatPrice(tax, currency)}</dd>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Order total</dt>
              <dd className="text-base font-medium text-gray-900">
                {formatPrice(total, currency)}
              </dd>
            </div>
          </dl>

          <form className="mt-6 border-t border-gray-200 pt-6" onSubmit={handleDiscountSubmit}>
            <label htmlFor="discount-code" className="text-sm font-medium text-gray-900">
              Discount code
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="discount-code"
                name="discountCode"
                value={discountCode}
                onChange={(event) => {
                  setDiscountCode(event.target.value);
                  setDiscountApplied(false);
                  clearError();
                }}
                placeholder="Enter code"
                autoComplete="off"
                disabled={isUpdating}
              />
              <Button type="submit" variant="outline" disabled={isUpdating || !discountCode.trim()}>
                Apply
              </Button>
            </div>
            {appliedCodes.length > 0 ? (
              <p className="mt-2 text-xs text-gray-500">Applied: {appliedCodes.join(', ')}</p>
            ) : null}
            {discountApplied ? (
              <p role="status" className="mt-2 text-sm text-green-700">
                Discount code applied.
              </p>
            ) : null}
          </form>

          <div className="mt-6">
            {checkoutUrl ? (
              <Button asChild className="w-full" size="lg">
                <a href={checkoutUrl}>Checkout</a>
              </Button>
            ) : (
              <Button className="w-full" size="lg" disabled>
                Checkout unavailable
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-gray-500">
              Shipping and final taxes are confirmed at checkout.
            </p>
          </div>

          <Button asChild variant="link" className="mt-4 w-full">
            <Link href={continueShoppingHref}>Continue shopping</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div
      className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12"
      aria-label="Loading cart"
    >
      <div className="rounded-sm border border-gray-200 bg-white px-4 sm:px-6 lg:col-span-7">
        <div className="border-b border-gray-200 py-4">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="divide-y divide-gray-200">
          <CartLineItemSkeleton />
          <CartLineItemSkeleton />
          <CartLineItemSkeleton />
        </div>
      </div>
      <div className="mt-8 rounded-sm border border-gray-200 bg-white p-6 lg:col-span-5 lg:mt-0">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
