'use client';

import { useMemo } from 'react';
import type { Product } from '@finqu/storefront-types';
import { ProductGallery } from './product-gallery';
import { ProductInfo, ProductDetails } from './product-info';
import { VariantSelector } from './variant-selector';
import { AddToCart } from './add-to-cart';
import { ProductBreadcrumb } from './product-breadcrumb';
import { GradientBorder } from '../shared';
import { useStore } from '@/lib/context-providers/store-context';

interface ProductCardProps {
  product: Product;
  currency?: string;
}

export function ProductCard({ product, currency = 'EUR' }: ProductCardProps) {
  const { routes } = useStore();
  // Use the default/selected variant for display
  const selectedVariant = product.defaultOrSelectedVariant;

  // Use product images directly
  const images = useMemo(() => {
    return (product.images ?? [])
      .filter((img) => img?.url)
      .map((img) => ({ url: img.url!, alt: img.alt }));
  }, [product.images]);

  // Build breadcrumb items from product categories
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [];
    const catalogUrl = routes?.catalogUrl;

    // Add category if available
    if (product.productGroups && product.productGroups.length > 0) {
      const category = product.productGroups[0];
      if (category?.title && category?.handle) {
        items.push({
          label: category.title,
          href: category.url!,
        });
      }
    } else if (catalogUrl) {
      items.push({ label: 'Products', href: catalogUrl });
    }

    return items;
  }, [product.productGroups, routes]);

  const isAvailable = selectedVariant?.isAvailable ?? product.isAvailable ?? true;

  // Merge regular options and combinedListing options (combinedListing first)
  const allOptions = useMemo(() => {
    const regularOptions = product.optionsWithValues ?? [];
    const combinedOptions = product.combinedListing?.optionsWithValues ?? [];
    return [...combinedOptions, ...regularOptions];
  }, [product.optionsWithValues, product.combinedListing?.optionsWithValues]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="relative px-4 py-4 sm:px-6">
        <GradientBorder position="top" />
        <ProductBreadcrumb items={breadcrumbItems} currentPage={product.title || 'Product'} />
        <GradientBorder position="bottom" />
      </div>

      {/* Main Product Section */}
      <div className="h-full lg:grid lg:grid-cols-2 lg:items-start">
        {/* Gallery */}
        <div className="max-h-[70vh] w-full lg:sticky lg:top-4 lg:h-full lg:max-h-none">
          <ProductGallery images={images} productTitle={product.title ?? undefined} />
        </div>

        {/* Product Info */}
        <div className="h-full border-l bg-white">
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant ?? undefined}
            currency={currency}
          />

          {/* Variant Selector - renders options that link to variant URLs */}
          {allOptions.length > 0 && (
            <div className="border-t">
              <VariantSelector options={allOptions} />
            </div>
          )}

          {/* Add to Cart */}
          <AddToCart
            className="border-t p-4 sm:p-6"
            productId={product.defaultOrSelectedVariant!.productId!}
            isAvailable={isAvailable}
          />

          {/* Product Details (Description, Specs, Shipping) */}
          <ProductDetails product={product} />
        </div>
      </div>
    </>
  );
}
