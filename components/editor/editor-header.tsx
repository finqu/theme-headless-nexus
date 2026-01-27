'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsDialog } from './settings-dialog';
import { TEMPLATE_TYPES, TEMPLATE_TYPE_LABELS, type TemplateType } from '@/lib/template-types';

type EditorMode = 'page' | 'template';

interface Page {
  id: string; // Finqu's stable page ID
  slug: string; // Current locale's URL slug (for display)
  title: string;
  editUrl: string;
  source: 'local' | 'storefront';
}

interface EditorHeaderProps {
  mode: EditorMode;
  type?: TemplateType | null;
  pageId?: string | null; // For pages - Finqu's stable page ID
  slug?: string | null; // For template overrides
  hasUnpublishedChanges?: boolean;
  isInherited?: boolean;
  hasOverride?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

export function EditorHeader({
  mode,
  type,
  pageId,
  slug,
  hasUnpublishedChanges = false,
  isInherited = false,
  hasOverride = false,
  saveStatus = 'idle',
}: EditorHeaderProps) {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);

  // Fetch pages on mount
  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch('/api/puck/pages');
        if (res.ok) {
          const data = await res.json();
          setPages(data.pages || []);
        }
      } catch (error) {
        console.error('Failed to fetch pages:', error);
      }
    }
    fetchPages();
  }, []);

  // Compute current selection value for the combined dropdown
  // For pages, use page:{id} with Finqu's stable page ID
  // For templates, use template:{type}
  const currentSelection =
    mode === 'page' && pageId
      ? `page:${pageId}`
      : mode === 'template'
        ? `template:${type || TEMPLATE_TYPES[0]}`
        : '';

  const handleSelectionChange = (value: string) => {
    if (value.startsWith('page:')) {
      // Navigate to page editor using Finqu's stable page ID
      const selectedPageId = value.replace('page:', '');
      router.push(`/editor?mode=page&id=${selectedPageId}`);
    } else if (value.startsWith('template:')) {
      const templateType = value.replace('template:', '');
      router.push(`/editor?mode=template&type=${templateType}`);
    }
  };

  return (
    <header className="flex items-center justify-between bg-black p-2 text-white">
      {/* Left section: Mode and template selection */}
      <div className="flex items-center gap-3">
        {/* Combined page/template selector */}
        <Select value={currentSelection} onValueChange={handleSelectionChange}>
          <SelectTrigger className="h-7 w-[180px] border-zinc-700 bg-zinc-900 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto border-zinc-700 bg-zinc-900 text-white">
            {/* Pages group */}
            <SelectGroup>
              <SelectLabel className="text-zinc-400">Pages</SelectLabel>
              {pages.length === 0 ? (
                <SelectItem
                  value="no-pages"
                  disabled
                  className="text-xs focus:bg-zinc-800 focus:text-white"
                >
                  <span className="flex items-center gap-2 text-zinc-500">No pages available</span>
                </SelectItem>
              ) : (
                pages.map((page) => (
                  <SelectItem
                    key={page.id}
                    value={`page:${page.id}`}
                    className="text-xs focus:bg-zinc-800 focus:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {page.title}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectGroup>

            {/* Templates group */}
            <SelectGroup>
              <SelectLabel className="text-zinc-400">Templates</SelectLabel>
              {TEMPLATE_TYPES.map((templateType) => (
                <SelectItem
                  key={templateType}
                  value={`template:${templateType}`}
                  className="text-xs focus:bg-zinc-800 focus:text-white"
                >
                  <span className="flex items-center gap-2">
                    <LayoutTemplate className="h-3 w-3" />
                    {TEMPLATE_TYPE_LABELS[templateType]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Override indicator */}
        {mode === 'template' && slug && hasOverride && (
          <span className="rounded-sm bg-blue-600 px-2 py-0.5 text-xs font-medium">
            Override: {slug}
          </span>
        )}

        {/* Inheritance indicator */}
        {mode === 'template' && isInherited && (
          <span className="rounded-sm bg-zinc-700 px-2 py-0.5 text-xs">Using default</span>
        )}

        {/* Settings dialog */}
        <SettingsDialog />
      </div>

      {/* Right section: Status and settings */}
      <div className="flex items-center gap-3">
        {/* Save status */}
        <span
          className={`text-xs ${
            saveStatus === 'saving'
              ? 'text-zinc-400'
              : saveStatus === 'saved'
                ? 'text-green-400'
                : saveStatus === 'error'
                  ? 'text-red-400'
                  : 'text-zinc-500'
          }`}
        >
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
        </span>

        {/* Unpublished changes badge */}
        {hasUnpublishedChanges && (
          <span className="inline-flex items-center rounded-sm bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 inset-ring inset-ring-yellow-400/20">
            Unpublished changes
          </span>
        )}
      </div>
    </header>
  );
}
