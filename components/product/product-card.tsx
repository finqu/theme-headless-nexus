'use client';

import { useState, useMemo } from 'react';
import type { Product, ProductVariant } from '@finqu/storefront-types';
import { ProductGallery } from './product-gallery';
import { ProductInfo, ProductDetails } from './product-info';
import { VariantSelector } from './variant-selector';
import { AddToCart } from './add-to-cart';
import { ProductBreadcrumb } from './product-breadcrumb';
import { Separator } from '@/components/ui/separator';

interface ProductCardProps {
  product: Product;
  currency?: string;
}

export function ProductCard({ product, currency = 'EUR' }: ProductCardProps) {
  // Get initial variant - prefer default variant or first available
  const initialVariant = useMemo(() => {
    const defaultVariant = product.defaultOrSelectedVariant;
    if (defaultVariant?.id) {
      return defaultVariant;
    }
    // Fallback to first variant
    return product.variants?.[0];
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(() => {
    const id = initialVariant?.id;
    return id ? parseInt(id, 10) : undefined;
  });

  // Find the currently selected variant
  const selectedVariant = useMemo(() => {
    if (selectedVariantId == null || !product.variants) {
      return initialVariant;
    }
    return (
      product.variants.find((v) => v.id && parseInt(v.id, 10) === selectedVariantId) ||
      initialVariant
    );
  }, [selectedVariantId, product.variants, initialVariant]);

  // Collect all product images from variants
  const images = useMemo(() => {
    const imgs: { url: string; alt?: string | null }[] = [];

    // Add selected variant image first
    if (selectedVariant?.image?.url) {
      imgs.push({ url: selectedVariant.image.url, alt: selectedVariant.image.alt });
    }

    // Add featured image
    if (selectedVariant?.featuredImage?.url) {
      const exists = imgs.some((img) => img.url === selectedVariant.featuredImage?.url);
      if (!exists) {
        imgs.push({
          url: selectedVariant.featuredImage.url,
          alt: selectedVariant.featuredImage.alt,
        });
      }
    }

    // Add variant images from all variants
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant?.image?.url) {
          const exists = imgs.some((i) => i.url === variant.image?.url);
          if (!exists) {
            imgs.push({ url: variant.image.url, alt: variant.image.alt });
          }
        }
        if (variant?.featuredImage?.url) {
          const exists = imgs.some((i) => i.url === variant.featuredImage?.url);
          if (!exists) {
            imgs.push({ url: variant.featuredImage.url, alt: variant.featuredImage.alt });
          }
        }
      }
    }

    return imgs;
  }, [product, selectedVariant]);

  // Build breadcrumb items from product categories
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [];

    // Add "Products" as base
    items.push({ label: 'Products', href: '/products' });

    // Add category if available
    if (product.productGroups && product.productGroups.length > 0) {
      const category = product.productGroups[0];
      if (category?.title && category?.handle) {
        items.push({
          label: category.title,
          href: `/collections/${category.handle}`,
        });
      }
    }

    return items;
  }, [product.productGroups]);

  const variants = product.variants ?? [];
  const isAvailable = selectedVariant?.isAvailable ?? product.isAvailable ?? true;

  return (
    <div className="bg-white">
      <div className="">
        {/* Breadcrumb */}
        <div className="border-b px-4 py-4 sm:px-6">
          <ProductBreadcrumb items={breadcrumbItems} currentPage={product.title || 'Product'} />
        </div>

        {/* Main Product Section */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start">
          {/* Gallery */}
          <div className="px-4 py-8 sm:px-6 lg:sticky lg:top-4">
            <ProductGallery images={images} productTitle={product.title ?? undefined} />
          </div>

          {/* Product Info */}
          <div className="mt-10 border-l px-4 py-8 sm:px-6 lg:mt-0">
            <ProductInfo product={product} selectedVariant={selectedVariant} currency={currency} />

            <Separator className="my-6" />

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mb-6">
                <VariantSelector
                  variants={variants}
                  options={product.optionsWithValues ?? undefined}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                />
              </div>
            )}

            {/* Add to Cart */}
            <AddToCart
              productId={
                selectedVariant?.productId ? parseInt(selectedVariant.productId, 10) : undefined
              }
              isAvailable={isAvailable}
            />

            <Separator className="my-8" />

            {/* Product Details (Description, Specs, Shipping) */}
            <ProductDetails product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
