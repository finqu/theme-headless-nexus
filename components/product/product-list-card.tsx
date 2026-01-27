import type { ProductListItem } from '@/lib/types';
import { formatPrice, getProductImage, PriceDisplay, ImagePlaceholder } from '@/components/shared';

export interface ProductListCardProps {
  product: ProductListItem;
  showPrice?: boolean;
  showDescription?: boolean;
}

export function ProductListCard({
  product,
  showPrice = true,
  showDescription = false,
}: ProductListCardProps) {
  const variant = product.defaultOrSelectedVariant;
  const image = getProductImage(product);
  const href = variant?.url;

  const content = (
    <>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 @xl:aspect-3/4">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt || product.title || ''}
            className="transition-duration-300 h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder text="No image" />
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
            <PriceDisplay
              price={variant.price}
              originalPrice={variant.originalPrice}
              size="sm"
              className="font-normal"
            />
          )}
        </div>
      </div>
    </>
  );

  return (
    <article className="group h-full">
      {href ? (
        <a href={href} className="grid h-full grid-rows-[auto_1fr]">
          {content}
        </a>
      ) : (
        <div className="grid h-full grid-rows-[auto_1fr]">{content}</div>
      )}
    </article>
  );
}
