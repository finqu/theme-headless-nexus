'use client';

import { useMemo } from 'react';
import type { ProductVariant, ProductOption } from '@finqu/storefront-types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  options?: ProductOption[];
  selectedVariantId?: number;
  onVariantChange: (variantId: number) => void;
}

/**
 * Variant selector component that renders option selectors based on product options.
 * Uses ToggleGroup for small option sets (≤5) and Select for larger sets.
 */
export function VariantSelector({
  variants,
  options,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  // If only one variant, don't show selector
  if (!variants || variants.length <= 1) {
    return null;
  }

  // If we have structured options, render option-based selectors
  if (options && options.length > 0) {
    return (
      <div className="space-y-4">
        {options.map((option, index) => (
          <OptionSelector
            key={option.handle || `option-${index}`}
            option={option}
            variants={variants}
            selectedVariantId={selectedVariantId}
            onVariantChange={onVariantChange}
          />
        ))}
      </div>
    );
  }

  // Fallback: simple variant dropdown
  // Select component requires string values, so we convert
  const selectedIdStr = selectedVariantId != null ? String(selectedVariantId) : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">Variant</label>
      <Select value={selectedIdStr} onValueChange={(value) => onVariantChange(parseInt(value, 10))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select variant" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id ?? ''} disabled={!variant.isAvailable}>
              {variant.title}
              {!variant.isAvailable && ' (Out of stock)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface OptionSelectorProps {
  option: ProductOption;
  variants: ProductVariant[];
  selectedVariantId?: number;
  onVariantChange: (variantId: number) => void;
}

function OptionSelector({
  option,
  variants,
  selectedVariantId,
  onVariantChange,
}: OptionSelectorProps) {
  const optionValues = option.values ?? [];
  const useToggle = optionValues.length <= 6;

  // Find current selected value for this option
  const selectedVariant = variants.find((v) => v.id && parseInt(v.id, 10) === selectedVariantId);

  // Get the selected value handle for this option
  const selectedValueHandle = useMemo(() => {
    if (!selectedVariant?.options) return undefined;
    // Find the variant option that matches this product option by comparing option.handle
    const variantOption = selectedVariant.options.find(
      (vo) => vo?.option?.handle === option.handle
    );
    return variantOption?.value?.handle ?? undefined;
  }, [selectedVariant, option.handle]);

  // Handle value change - find variant with this option value
  const handleValueChange = (valueHandle: string) => {
    // Find a variant that has this option value
    const matchingVariant = variants.find((variant) => {
      const variantOption = variant.options?.find((vo) => vo?.option?.handle === option.handle);
      return variantOption?.value?.handle === valueHandle;
    });

    if (matchingVariant?.id) {
      onVariantChange(parseInt(matchingVariant.id, 10));
    }
  };

  if (useToggle) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">{option.title}</label>
        <ToggleGroup
          type="single"
          value={selectedValueHandle}
          onValueChange={(value) => value && handleValueChange(value)}
          className="flex flex-wrap gap-2"
        >
          {optionValues.map((optValue) => {
            const valueHandle = optValue?.handle;
            const valueTitle = optValue?.title;
            if (!valueHandle) return null;

            // Check if this option value is available in any variant
            const isAvailable = variants.some((variant) => {
              const variantOption = variant.options?.find(
                (vo) => vo?.option?.handle === option.handle
              );
              return variantOption?.value?.handle === valueHandle && variant.isAvailable;
            });

            return (
              <ToggleGroupItem
                key={valueHandle}
                value={valueHandle}
                disabled={!isAvailable}
                className={cn(
                  'min-w-12 border px-4 py-2',
                  !isAvailable && 'line-through opacity-50'
                )}
              >
                {valueTitle || valueHandle}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
    );
  }

  // Use Select for larger option sets
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">{option.title}</label>
      <Select value={selectedValueHandle} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${option.title}`} />
        </SelectTrigger>
        <SelectContent>
          {optionValues.map((optValue) => {
            const valueHandle = optValue?.handle;
            const valueTitle = optValue?.title;
            if (!valueHandle) return null;

            const isAvailable = variants.some((variant) => {
              const variantOption = variant.options?.find(
                (vo) => vo?.option?.handle === option.handle
              );
              return variantOption?.value?.handle === valueHandle && variant.isAvailable;
            });

            return (
              <SelectItem key={valueHandle} value={valueHandle} disabled={!isAvailable}>
                {valueTitle || valueHandle}
                {!isAvailable && ' (Out of stock)'}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
