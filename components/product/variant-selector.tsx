'use client';

import Link from 'next/link';
import type { ProductOption, ProductOptionValue } from '@finqu/storefront-types';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  options?: ProductOption[];
}

/**
 * Variant selector component that renders option selectors based on product options.
 * Each option value links to its variant URL when clicked.
 * Only renders option values that have a variant with a URL.
 */
export function VariantSelector({ options }: VariantSelectorProps) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 py-4 sm:py-6">
      {options.map((option, index) => (
        <OptionSelector key={option.handle || `option-${index}`} option={option} />
      ))}
    </div>
  );
}

interface OptionSelectorProps {
  option: ProductOption;
}

function OptionSelector({ option }: OptionSelectorProps) {
  // Filter to only include option values that have a variant with a URL
  const optionValues = (option.values ?? []).filter(
    (value): value is ProductOptionValue => !!value?.variant?.url
  );
  // Don't render if no valid option values
  if (optionValues.length === 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6">
      <label className="text-sm font-medium text-gray-900">{option.title}</label>
      <div className="flex flex-wrap gap-1.5">
        {optionValues.map((optValue) => {
          const variant = optValue.variant!;
          const isAvailable = variant.isAvailable ?? true;
          const isSelected = optValue.selected ?? false;
          const title = optValue.title || optValue.handle || '';

          return (
            <Link
              key={optValue.handle}
              href={variant.url!}
              className={cn(
                'inline-flex items-center justify-center rounded-sm border px-4 py-2 text-sm transition-colors',
                isSelected ? 'border-gray-900 bg-gray-50 font-medium' : 'hover:border-gray-400',
                !isAvailable && 'opacity-50'
              )}
            >
              <span className={cn(!isAvailable && 'line-through')}>{title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
