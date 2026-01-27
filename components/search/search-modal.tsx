'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@finqu/storefront-types';
import { useLocale } from '@/lib/context-providers/locale-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProducts } from '@/blocks/product-grid/shared';
import {
  formatPrice,
  getProductImageUrl,
  isOnSale,
  PriceDisplay,
  ImagePlaceholder,
} from '@/components/shared';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL to search results page */
  searchPageUrl?: string;
}

export function SearchModal({ open, onOpenChange, searchPageUrl = '/search' }: SearchModalProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const products = await fetchProducts({
          query: query.trim(),
          first: 6,
        });
        setResults(products);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onOpenChange(false);
        router.push(`${searchPageUrl}?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router, searchPageUrl, onOpenChange]
  );

  const handleProductClick = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search products</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="border-b p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 pl-10"
              autoFocus
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16 flex-shrink-0 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No products found for &quot;{query}&quot;</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Products</span>
                <Link
                  href={`${searchPageUrl}?q=${encodeURIComponent(query)}`}
                  onClick={handleProductClick}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {results.map((product) => {
                  const imageUrl = getProductImageUrl(product);
                  const variant = product.defaultOrSelectedVariant;
                  const price = variant?.price;
                  const originalPrice = variant?.originalPrice;
                  const productOnSale = isOnSale(originalPrice, price);

                  return (
                    <Link
                      key={product.id}
                      href={product.defaultOrSelectedVariant?.url || '#'}
                      onClick={handleProductClick}
                      className="flex gap-4 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.title || ''}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <ImagePlaceholder size="sm" text="No image" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                        {price != null && (
                          <div className="mt-1">
                            <PriceDisplay
                              price={price}
                              originalPrice={originalPrice}
                              size="sm"
                              className="gap-1"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Start typing to search products</p>
            </div>
          )}
        </div>

        {/* Footer - View all results */}
        {hasSearched && results.length > 0 && (
          <div className="border-t p-4">
            <Button asChild className="w-full">
              <Link
                href={`${searchPageUrl}?q=${encodeURIComponent(query)}`}
                onClick={handleProductClick}
              >
                View all results
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
