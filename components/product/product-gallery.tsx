'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImage {
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productTitle?: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || productTitle || 'Product image'}
          width={800}
          height={800}
          className="h-full w-full object-cover object-center"
          priority
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
                selectedIndex === index
                  ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
