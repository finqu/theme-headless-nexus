'use client';

import { createUsePuck } from '@puckeditor/core';

// Create usePuck hook with selector support to avoid unnecessary re-renders
const usePuck = createUsePuck();
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
import { ButtonGroup } from '@/components/ui/button-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SettingsDialog } from './settings-dialog';
import { TEMPLATE_TYPES, TEMPLATE_TYPE_LABELS, type TemplateType } from '@/lib/template-types';
import type { Locale } from '@finqu/storefront-types';

type EditorMode = 'page' | 'template';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface Page {
  id: string;
  slug: string;
  title: string;
  editUrl: string;
  source: 'local' | 'storefront';
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
  /** Current locale/language code */
  currentLocale?: string;
  /** Pages list (controlled from parent to support locale changes) */
  pages?: Page[];
  onPublish: () => void;
  /** Called when language is changed in the selector */
  onLanguageChange?: (locale: string) => void;
}

export function EditorToolbar({
  mode,
  type,
  pageId,
  slug,
  hasUnpublishedChanges = false,
  saveStatus = 'idle',
  locales = [],
  currentLocale,
  pages = [],
  onPublish,
  onLanguageChange,
}: EditorToolbarProps) {
  // Use selectors to only subscribe to the state we need
  const currentViewport = usePuck((s) => s.appState?.ui?.viewports?.current);
  const dispatch = usePuck((s) => s.dispatch);
  const history = usePuck((s) => s.history);

  // Find primary locale or use first one
  const primaryLocale = locales.find((l) => l.primary) || locales[0];
  // Use controlled locale from props, or fallback to primary
  const selectedLanguage = currentLocale || primaryLocale?.isoCode || 'fi';

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    if (onLanguageChange) {
      onLanguageChange(newLocale);
    }
  };

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
    // Preserve current locale in navigation URLs
    const localeParam = currentLocale ? `&locale=${currentLocale}` : '';

    if (value.startsWith('page:')) {
      const selectedPageId = value.replace('page:', '');
      // Use window.location for navigation as router.push doesn't work well inside Puck context
      window.location.href = `/editor?mode=page&id=${selectedPageId}${localeParam}`;
    } else if (value.startsWith('template:')) {
      const templateType = value.replace('template:', '');
      window.location.href = `/editor?mode=template&type=${templateType}${localeParam}`;
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
  const previewUrl =
    mode === 'page' && pageId
      ? `/?preview=true&pageId=${pageId}`
      : mode === 'template' && type
        ? `/?preview=true&template=${type}`
        : '/';

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-2 text-white">
      {/* Left section: Preview button */}
      <div className="flex items-center gap-1.5">
        {/* Settings */}
        <SettingsDialog />
      </div>

      {/* Center section: Viewports, Page selector, Language */}
      <div className="flex items-center gap-2">
        {/* Viewport controls */}
        <ToggleGroup
          type="single"
          value={
            currentViewport?.width !== undefined
              ? String(currentViewport.width)
              : String(defaultViewports[0].width)
          }
          onValueChange={(value: string) => {
            const viewport = defaultViewports.find((v) => String(v.width) === value);
            if (viewport) {
              selectViewport(viewport);
            }
          }}
          className="rounded-sm bg-zinc-800"
        >
          {defaultViewports.map((viewport, index) => {
            const icon = viewportIcons[viewport.icon] || <Monitor className="h-3.5 w-3.5" />;

            return (
              <ToggleGroupItem
                key={`${viewport.width}-${index}`}
                value={String(viewport.width)}
                aria-label={viewport.label}
                className="w-10"
              >
                {icon}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        {/* Page/Template selector */}
        <Select value={currentSelection} onValueChange={handleSelectionChange}>
          <SelectTrigger
            size="sm"
            className="w-[160px] border-zinc-700 bg-zinc-800 text-xs text-white focus:ring-0 focus:ring-offset-0"
          >
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
              <SelectLabel className="text-xs text-zinc-400">Pages</SelectLabel>
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
              <SelectLabel className="text-xs text-zinc-400">Templates</SelectLabel>
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
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger
              size="sm"
              className="w-[60px] border-zinc-700 bg-zinc-800 text-xs text-white focus:ring-0 focus:ring-offset-0"
            >
              <div className="flex items-center gap-1">
                <span className="uppercase">{selectedLanguage}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-white">
              {locales
                .filter((locale): locale is typeof locale & { isoCode: string } => !!locale.isoCode)
                .map((locale) => (
                  <SelectItem
                    key={locale.isoCode}
                    value={locale.isoCode}
                    className="text-xs focus:bg-zinc-700 focus:text-white"
                  >
                    <span className="uppercase">{locale.isoCode}</span>
                    <span className="ml-1.5 text-zinc-400">
                      ({locale.endonymName || locale.name})
                    </span>
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
        <ButtonGroup>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:text-zinc-600"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:text-zinc-600"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </ButtonGroup>

        {/* Publish button */}
        <Button
          onClick={onPublish}
          size="sm"
          className="bg-blue-600/50 text-xs font-medium text-white ring-blue-600 hover:bg-blue-700"
        >
          Publish
        </Button>
      </div>
    </header>
  );
}
