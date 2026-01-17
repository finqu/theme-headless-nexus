'use client';

import { useState, useEffect } from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import type { Product } from '@finqu/storefront-lib/types';
import { storefrontServer } from '@/lib/storefront';
import { products } from '@finqu/storefront-lib/server';

/**
 * Props for the ProductGrid component
 */
interface ProductGridProps {
  title?: string;
  selectedProducts?: Product[];
  columns?: 2 | 3 | 4;
  showPrice?: boolean;
  showDescription?: boolean;
}

/**
 * Component category for the Puck editor sidebar
 */
export const category = 'E-commerce';

/**
 * Custom Product Picker Field Component
 * Displays products as cards with Add/Remove functionality
 */
function ProductPickerField({
  value,
  onChange,
}: {
  value: Product[] | undefined;
  onChange: (products: Product[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedProducts = value || [];
  const selectedIds = new Set(selectedProducts.map((p) => p.id));

  // Fetch products when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await products(
        storefrontServer,
        {
          query: searchQuery || undefined,
          first: 20,
        },
        {
          query: `
            query Products($query: String, $limit: Int, $offset: Int, $sort: String, $productGroup: String, $priceMin: Float, $priceMax: Float, $onlyDiscounted: Boolean, $onlyNew: Boolean, $first: Int, $after: String, $last: Int, $before: String, $sortKey: String, $reverse: Boolean) {
                products(query: $query, limit: $limit, offset: $offset, sort: $sort, productGroup: $productGroup, priceMin: $priceMin, priceMax: $priceMax, onlyDiscounted: $onlyDiscounted, onlyNew: $onlyNew, first: $first, after: $after, last: $last, before: $before, sortKey: $sortKey, reverse: $reverse) {
                  edges {
                    node {
                      handle
                      seoDescription
                      seoTitle
                      seoKeywords
                      id
                      hasOnlyDefaultVariant
                      inPreview
                      isAvailable
                      isDirectlyBuyable
                      title
                      shortDescription
                      description
                      returnPolicyTimeLimit
                      rating
                      reviewCount
                      maxRating
                      reviewsAreEnabled
                      rate
                      firstAvailableVariant {
                        id
                        title
                        sku
                        price
                        featuredImage {
                          url
                          alt
                        }
                      }
                    }
                    cursor
                  }
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                  }
                  totalCount
                }
              }
          `,
        }
      );
      const productList = result.edges?.map((edge) => edge.node).filter(Boolean) || [];
      setAvailableProducts(productList as Product[]);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setAvailableProducts([]);
    }
    setIsLoading(false);
  };

  const addProduct = (product: Product) => {
    if (!selectedIds.has(product.id)) {
      onChange([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: number | null | undefined) => {
    onChange(selectedProducts.filter((p) => p.id !== productId));
  };

  const getProductImage = (product: Product) => {
    const variant = product.firstAvailableVariant;
    return variant?.featuredImage?.url || variant?.image?.url;
  };

  return (
    <div className="space-y-3">
      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 rounded-md border bg-white p-2"
              >
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product) || undefined}
                    alt={product.title || ''}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                    <span className="text-xs text-gray-400">No img</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{product.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Products Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Products
      </button>

      {/* Product Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold">Select Products</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
                title="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="border-b px-4 py-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No products found</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableProducts.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    const imageUrl = getProductImage(product);
                    const variant = product.firstAvailableVariant;

                    return (
                      <div
                        key={product.id}
                        className={`overflow-hidden rounded-lg border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title || ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-sm text-gray-400">No image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                          <h4 className="line-clamp-2 text-sm font-medium">{product.title}</h4>
                          {variant?.price != null && (
                            <p className="mt-1 text-sm text-gray-500">
                              {variant.price.toFixed(2)} €
                            </p>
                          )}

                          {/* Add/Remove Button */}
                          <button
                            type="button"
                            onClick={() =>
                              isSelected ? removeProduct(product.id) : addProduct(product)
                            }
                            className={`mt-2 w-full rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-sm text-gray-500">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Puck component configuration with custom multi-select product picker
 */
export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    selectedProducts: {
      type: 'custom',
      label: 'Products',
      render: ({ value, onChange }) => (
        <ProductPickerField value={value as Product[] | undefined} onChange={onChange} />
      ),
    },
    columns: {
      type: 'radio',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
      ],
    },
    showPrice: {
      type: 'radio',
      label: 'Show Price',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    showDescription: {
      type: 'radio',
      label: 'Show Description',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    title: 'Featured Products',
    columns: 3,
    showPrice: true,
    showDescription: false,
  },
  render: ({ title, selectedProducts, columns = 3, showPrice = true, showDescription = false }) => {
    // Grid column classes based on selection
    const gridCols = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    // Handle no products selected state
    if (!selectedProducts || !Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return (
        <section className="py-12">
          <div className="container mx-auto px-4">
            {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                No products selected. Click to select products from your store.
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
          <div className={`grid gap-6 ${gridCols[columns]}`}>
            {selectedProducts.map((product: Product) => {
              const variant = product.firstAvailableVariant;
              const image = variant?.featuredImage || variant?.image;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || product.title || ''}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{product.title}</h3>

                    {showDescription && product.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {product.shortDescription}
                      </p>
                    )}

                    {showPrice && variant?.price != null && (
                      <div className="mt-2">
                        {variant.originalPrice && variant.originalPrice > variant.price ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-red-600">
                              {variant.price.toFixed(2)} €
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {variant.originalPrice.toFixed(2)} €
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {variant.price.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
};
