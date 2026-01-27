'use client';

import { Search } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SearchModal } from './search-modal';
import { cn } from '@/lib/utils';

interface SearchIconProps {
  className?: string;
  /** Show label next to icon */
  showLabel?: boolean;
}

export function SearchIcon({ className, showLabel }: SearchIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);

  return (
    <>
      <Button
        variant="ghost"
        size={showLabel ? 'default' : 'icon'}
        className={cn('h-full cursor-pointer', className)}
        onClick={openSearch}
        aria-label="Search"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
        {showLabel && <span className="ml-2">Search</span>}
      </Button>
      <SearchModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
