'use client';

import { useState, useEffect } from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import type { Product } from '@finqu/storefront-types';
import {
  ProductGrid,
  productGridDefaultProps,
  type ProductGridViewProps,
} from '@/components/product-grid';
import { fetchProducts, getProductImageUrl } from './shared';
import { useLocaleOptional } from '@/lib/locale-context';

/**
 * Props for the ProductGrid Puck component.
 * Stores product IDs for persistence; full products are kept for preview in editor.
 */
interface ProductGridProps extends Omit<ProductGridViewProps, 'products'> {
  /** Product IDs stored in Puck data (lightweight) */
  selectedProductIds?: number[];
  /** Full product objects for editor preview (populated by field) */
  selectedProducts?: Product[];
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

  // Access locale from context (returns null if outside provider)
  const localeContext = useLocaleOptional();
  const locale = localeContext?.locale;

  const selectedProducts = value || [];
  const selectedIds = new Set(selectedProducts.map((p) => p.id));

  // Fetch products when dialog opens or locale changes
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery, locale]);

  const loadProducts = async () => {
    setIsLoading(true);
    const products = await fetchProducts({
      query: searchQuery,
      first: 20,
    });
    setAvailableProducts(products);
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

  return (
    <div className="space-y-3">
      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedProducts.map((product) => {
              const imageUrl = getProductImageUrl(product);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-2 rounded-md border bg-white p-2"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
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
              );
            })}
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
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    const imageUrl = getProductImageUrl(product);
                    const variant = product.defaultOrSelectedVariant;

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
    ...productGridDefaultProps,
    selectedProductIds: [],
  },
  // Extract product IDs for lightweight persistence while keeping full products for preview
  resolveData: async ({ props }) => {
    const { selectedProducts, ...rest } = props;
    const selectedProductIds = selectedProducts
      ?.map((p) => p.id)
      .filter((id): id is number => id != null);

    return {
      props: {
        ...rest,
        selectedProductIds,
        selectedProducts,
      },
    };
  },
  render: ({ title, selectedProducts, columns, showPrice, showDescription }) => (
    <ProductGrid
      title={title}
      products={selectedProducts}
      columns={columns}
      showPrice={showPrice}
      showDescription={showDescription}
    />
  ),
};
