'use client';

import { useEffect, useState } from 'react';
import { usePuck } from '@puckeditor/core';
import {
  Monitor,
  Smartphone,
  MoveHorizontal,
  Undo2,
  Redo2,
  ExternalLink,
  FileText,
  LayoutTemplate,
  ChevronDown,
  Globe,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './settings-dialog';
import { TEMPLATE_TYPES, TEMPLATE_TYPE_LABELS, type TemplateType } from '@/lib/template-types';

type EditorMode = 'page' | 'template';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Page {
  id: string;
  slug: string;
  title: string;
  editUrl: string;
  source: 'local' | 'storefront';
}

interface Locale {
  endonymName: string;
  isoCode: string;
  name: string;
  primary: boolean;
  rootUrl: string;
}

/**
 * Default viewport configurations
 */
const defaultViewports = [
  { width: 1280, height: 'auto' as const, label: 'Desktop', icon: 'Monitor' },
  { width: 360, height: 'auto' as const, label: 'Mobile', icon: 'Smartphone' },
  { width: '100%' as const, height: 'auto' as const, label: 'Responsive', icon: 'MoveHorizontal' },
];

/**
 * Viewport control icons mapping
 */
const viewportIcons: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="h-3.5 w-3.5" />,
  Smartphone: <Smartphone className="h-3.5 w-3.5" />,
  MoveHorizontal: <MoveHorizontal className="h-3.5 w-3.5" />,
};

interface EditorToolbarProps {
  mode: EditorMode;
  type?: TemplateType | null;
  pageId?: string | null;
  slug?: string | null;
  hasUnpublishedChanges?: boolean;
  isInherited?: boolean;
  hasOverride?: boolean;
  saveStatus?: SaveStatus;
  locales?: Locale[];
  onPublish: () => void;
}

export function EditorToolbar({
  mode,
  type,
  pageId,
  slug,
  hasUnpublishedChanges = false,
  saveStatus = 'idle',
  locales = [],
  onPublish,
}: EditorToolbarProps) {
  const { appState, dispatch, history } = usePuck();
  const [pages, setPages] = useState<Page[]>([]);

  // Find primary locale or use first one
  const primaryLocale = locales.find(l => l.primary) || locales[0];
  const [selectedLanguage, setSelectedLanguage] = useState(primaryLocale?.isoCode || 'fi');

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

  // Get current viewport
  const currentViewport = appState?.ui?.viewports?.current;

  // Select viewport
  const selectViewport = (viewport: (typeof defaultViewports)[number]) => {
    dispatch({
      type: 'setUi',
      ui: {
        viewports: {
          current: {
            width: viewport.width,
            height: viewport.height,
          },
          controlsVisible: true,
          options: defaultViewports,
        },
      },
    });
  };

  // Undo/Redo handlers using history API
  const canUndo = history?.hasPast ?? false;
  const canRedo = history?.hasFuture ?? false;

  const handleUndo = () => {
    if (history?.back) {
      history.back();
    }
  };

  const handleRedo = () => {
    if (history?.forward) {
      history.forward();
    }
  };

  // Page/template selection
  const currentSelection =
    mode === 'page' && pageId
      ? `page:${pageId}`
      : mode === 'template'
        ? `template:${type || TEMPLATE_TYPES[0]}`
        : '';

  const handleSelectionChange = (value: string) => {
    if (value.startsWith('page:')) {
      const selectedPageId = value.replace('page:', '');
      // Use window.location for navigation as router.push doesn't work well inside Puck context
      window.location.href = `/editor?mode=page&id=${selectedPageId}`;
    } else if (value.startsWith('template:')) {
      const templateType = value.replace('template:', '');
      window.location.href = `/editor?mode=template&type=${templateType}`;
    }
  };

  // Get current page title for display
  const currentPageTitle =
    mode === 'page'
      ? pages.find((p) => p.id === pageId)?.title || 'Select page'
      : type
        ? TEMPLATE_TYPE_LABELS[type]
        : 'Select template';

  // Preview URL - opens the current page in a new tab
  const previewUrl = mode === 'page' && pageId
    ? `/?preview=true&pageId=${pageId}`
    : mode === 'template' && type
      ? `/?preview=true&template=${type}`
      : '/';

  return (
    <header className="flex h-10 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-2 text-white">
      {/* Left section: Theme dropdown */}
      <div className="flex items-center gap-1.5">
        {/* Theme/Preview dropdown */}
        <div className="group relative">
          <button className="flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs font-medium transition-colors hover:bg-zinc-600">
            Theme
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="invisible absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-zinc-700 bg-zinc-800 py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </a>
          </div>
        </div>

        {/* Settings */}
        <SettingsDialog />
      </div>

      {/* Center section: Viewports, Page selector, Language */}
      <div className="flex items-center gap-2">
        {/* Viewport controls */}
        <div className="flex items-center rounded bg-zinc-800">
          {defaultViewports.map((viewport, index) => {
            const isActive = currentViewport?.width === viewport.width;
            const icon = viewportIcons[viewport.icon] || <Monitor className="h-3.5 w-3.5" />;

            return (
              <button
                key={`${viewport.width}-${index}`}
                onClick={() => selectViewport(viewport)}
                className={`flex items-center justify-center rounded p-1 transition-colors ${
                  isActive
                    ? 'bg-zinc-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
                title={viewport.label}
              >
                {icon}
              </button>
            );
          })}
        </div>

        {/* Page/Template selector */}
        <Select value={currentSelection} onValueChange={handleSelectionChange}>
          <SelectTrigger className="h-6 w-[160px] border-zinc-700 bg-zinc-800 text-xs text-white focus:ring-0 focus:ring-offset-0">
            <div className="flex items-center gap-1.5">
              {mode === 'page' ? (
                <FileText className="h-3 w-3 text-zinc-400" />
              ) : (
                <LayoutTemplate className="h-3 w-3 text-zinc-400" />
              )}
              <span className="truncate">{currentPageTitle}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto border-zinc-700 bg-zinc-800 text-white">
            <SelectGroup>
              <SelectLabel className="text-zinc-400 text-xs">Pages</SelectLabel>
              {pages.length === 0 ? (
                <SelectItem
                  value="no-pages"
                  disabled
                  className="text-xs focus:bg-zinc-700 focus:text-white"
                >
                  <span className="text-zinc-500">No pages available</span>
                </SelectItem>
              ) : (
                pages.map((page) => (
                  <SelectItem
                    key={page.id}
                    value={`page:${page.id}`}
                    className="text-xs focus:bg-zinc-700 focus:text-white"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      {page.title}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-zinc-400 text-xs">Templates</SelectLabel>
              {TEMPLATE_TYPES.map((templateType) => (
                <SelectItem
                  key={templateType}
                  value={`template:${templateType}`}
                  className="text-xs focus:bg-zinc-700 focus:text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutTemplate className="h-3 w-3" />
                    {TEMPLATE_TYPE_LABELS[templateType]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Language selector */}
        {locales.length > 0 && (
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="h-6 w-[60px] border-zinc-700 bg-zinc-800 text-xs text-white focus:ring-0 focus:ring-offset-0">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-zinc-400" />
                <span className="uppercase">{selectedLanguage}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-white">
              {locales.map((locale) => (
                <SelectItem
                  key={locale.isoCode}
                  value={locale.isoCode}
                  className="text-xs focus:bg-zinc-700 focus:text-white"
                >
                  <span className="uppercase">{locale.isoCode}</span>
                  <span className="ml-1.5 text-zinc-400">({locale.endonymName})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Right section: Draft status, Undo/Redo, Publish */}
      <div className="flex items-center gap-2">
        {/* Draft status indicator */}
        <div className="flex items-center gap-1.5">
          {hasUnpublishedChanges && (
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span className="text-xs text-yellow-500">Draft</span>
            </div>
          )}
        </div>

        {/* Undo/Redo buttons */}
        <div className="flex items-center rounded bg-zinc-800">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`flex items-center justify-center rounded p-1 transition-colors ${
              canUndo
                ? 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                : 'cursor-not-allowed text-zinc-600'
            }`}
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`flex items-center justify-center rounded p-1 transition-colors ${
              canRedo
                ? 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                : 'cursor-not-allowed text-zinc-600'
            }`}
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Publish button */}
        <Button
          onClick={onPublish}
          className="h-6 bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
        >
          Publish
        </Button>
      </div>
    </header>
  );
}
