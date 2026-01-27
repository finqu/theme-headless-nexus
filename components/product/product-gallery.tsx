'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImagePlaceholder, SketchyLines } from '@/components/shared';

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
      <div className="relative h-full">
        {/* Sketchy lines background pattern - extends full width/height */}
        <SketchyLines angle={45} spacing={10} thickness={1} color="rgba(0, 0, 0, 0.06)" />
        <div className="relative z-10 px-4 py-8 sm:px-6">
          <div className="aspect-square w-full overflow-hidden border bg-gray-100">
            <ImagePlaceholder text="No image available" />
          </div>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="d-grid relative h-full place-content-center">
      {/* Sketchy lines background pattern - extends full width/height */}
      <SketchyLines angle={45} spacing={10} thickness={1} color="rgba(0, 0, 0, 0.06)" />

      {/* Gallery content with padding */}
      <div className="relative z-10 flex flex-col gap-4 px-4 py-8 sm:px-6">
        {/* Main Image */}
        <div className="aspect-square w-full overflow-hidden border bg-gray-100 lg:aspect-3/4">
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
          <div
            className="flex snap-x snap-proximity gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setSelectedIndex(index)}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  'relative h-20 w-20 flex-shrink-0 snap-end overflow-hidden rounded-sm border-1 transition-all',
                  selectedIndex === index
                    ? 'border-gray-400'
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
    </div>
  );
}
