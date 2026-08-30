'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildCategoryQuery, type CategorySortValue } from '@/lib/product-group';

interface SortOption {
  label: string;
  value: string;
}

interface ProductGroupSortProps {
  options: readonly SortOption[];
  value: CategorySortValue;
}

export function ProductGroupSort({ options, value }: ProductGroupSortProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2" data-pending={isPending ? '' : undefined}>
      <label htmlFor="category-sort" className="text-sm font-medium text-gray-700">
        Sort by
      </label>
      <Select
        value={value}
        onValueChange={(next) => {
          startTransition(() => {
            router.push(buildCategoryQuery({ sort: next }));
          });
        }}
      >
        <SelectTrigger id="category-sort" className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
