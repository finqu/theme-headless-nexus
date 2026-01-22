import { getProduct } from '@finqu/storefront-sdk/server';
import { storefrontClient } from '@/lib/storefront';
import { ProductCard } from '@/components/product';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPageProps {
  /** Product ID from URL */
  id: number;
  locale: string;
}

/**
 * Server component for rendering product detail pages.
 * Fetches product data from the Finqu API and renders the ProductCard client component.
 */
export async function ProductPage({ id, locale }: ProductPageProps) {
  try {
    const { product } = await getProduct(storefrontClient, { id });

    if (!product) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
            <p className="mt-2 text-gray-600">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      );
    }

    return <ProductCard product={product} />;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error loading product</h1>
          <p className="mt-2 text-gray-600">
            There was a problem loading this product. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
