import type { Product } from '@finqu/storefront-types';

export type ProductGridColumns = 2 | 3 | 4;

export interface ProductGridViewProps {
  title?: string;
  products?: Product[];
  columns?: ProductGridColumns;
  showPrice?: boolean;
  showDescription?: boolean;
  emptyMessage?: string;
  /**
   * Optional link builder; if provided and returns a string, the product card becomes clickable.
   */
  hrefForProduct?: (product: Product) => string | undefined;
}

export const productGridDefaultProps: Required<
  Pick<ProductGridViewProps, 'title' | 'columns' | 'showPrice' | 'showDescription'>
> = {
  title: 'Featured Products',
  columns: 3,
  showPrice: true,
  showDescription: false,
};

const gridCols: Record<ProductGridColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function formatEur(value: number) {
  return `${value.toFixed(2)} €`;
}

function getProductImage(product: Product) {
  const variant = product.defaultOrSelectedVariant;
  return variant?.featuredImage || variant?.image;
}

export function ProductGrid({
  title,
  products,
  columns = productGridDefaultProps.columns,
  showPrice = productGridDefaultProps.showPrice,
  showDescription = productGridDefaultProps.showDescription,
  emptyMessage = 'No products selected. Click to select products from your store.',
  hrefForProduct,
}: ProductGridViewProps) {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="mb-8 text-2xl font-bold tracking-tight">{title}</h2>}
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {products.map((product: Product) => {
            const variant = product.defaultOrSelectedVariant;
            const image = getProductImage(product);
            const href = hrefForProduct?.(product);

            const content = (
              <>
                {/* Product Image */}
                <div className="aspect-3/4 relative overflow-hidden bg-gray-50">
                  {image?.url ? (
                    <img
                      src={image.url}
                      alt={image.alt || product.title || ''}
                      className="transition-duration-300 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-50"
                  ></div>
                </div>

                {/* Product Info */}
                <div className="grid gap-6 p-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">{product.title}</h3>
                    {showDescription && product.shortDescription && (
                      <p className="me-0 line-clamp-2 text-sm tracking-wide text-gray-500">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto space-y-1">
                    {product.variants && product.variants.length > 1 && (
                      <div className="text-sm text-gray-500">{product.variants.length} options</div>
                    )}

                    {showPrice && variant?.price != null && (
                      <div>
                        {variant.originalPrice && variant.originalPrice > variant.price ? (
                          <div className="flex items-center gap-2">
                            <span className="font-normal">{formatEur(variant.price)}</span>
                            <span className="text-gray-400 line-through">
                              {formatEur(variant.originalPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-normal text-gray-900">
                            {formatEur(variant.price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );

            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                {href ? (
                  <a href={href} className="grid h-full grid-rows-[auto_1fr]">
                    {content}
                  </a>
                ) : (
                  <div className="grid h-full grid-rows-[auto_1fr]">{content}</div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
