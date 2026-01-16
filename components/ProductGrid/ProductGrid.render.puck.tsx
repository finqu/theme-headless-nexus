import type { ComponentConfig } from '@puckeditor/core';
import type { Product } from '@finqu/storefront-lib/types';

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
 * Puck component configuration (render-only version)
 */
export const config: ComponentConfig<ProductGridProps> = {
  label: 'Product Grid',
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
