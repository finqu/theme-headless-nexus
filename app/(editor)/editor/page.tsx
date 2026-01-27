'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Puck, createUsePuck, type Data } from '@puckeditor/core';
import { toast } from 'sonner';

// Create usePuck hook with selector support to avoid unnecessary re-renders
const usePuck = createUsePuck();
import { editorConfig, type EditorMetadata } from '@/lib/puck/config';
import '@puckeditor/core/puck.css';
import { isValidTemplateType, type TemplateType } from '@/lib/template-types';
import { EditorToolbar, type Page } from '@/components/editor/editor-toolbar';
import { LocaleProvider } from '@/lib/context-providers/locale-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import type { Locale } from '@/lib/store-cache';

/**
 * Editor mode: either editing a static page or a template
 */
type EditorMode = 'page' | 'template';

/**
 * Status indicator for save/publish state
 */
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Initial empty data for new pages/templates
 */
const emptyData: Data = {
  root: {},
  content: [],
};

/**
 * Default viewport configurations
 */
const defaultViewports = [
  { width: 1280, height: 'auto' as const, label: 'Desktop', icon: 'Monitor' },
  { width: 360, height: 'auto' as const, label: 'Mobile', icon: 'Smartphone' },
  { width: '100%' as const, height: 'auto' as const, label: 'Responsive', icon: 'MoveHorizontal' },
];

/**
 * Custom debounce hook
 */
function useDebouncedCallback<T extends (...args: never[]) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * Preview wrapper that applies viewport width
 */
function PreviewWithViewport() {
  // Use selector to only subscribe to viewport changes
  const currentViewport = usePuck((s) => s.appState?.ui?.viewports?.current);

  // Determine width style based on viewport
  const width = currentViewport?.width;
  const widthStyle = typeof width === 'number' ? `${width}px` : width === '100%' ? '100%' : '100%';

  return (
    <div
      className="mx-auto h-full transition-all duration-300"
      style={{
        width: widthStyle,
        maxWidth: '100%',
      }}
    >
      <Puck.Preview />
    </div>
  );
}

/**
 * Loading fallback for the editor
 */
function EditorLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading editor...</div>
    </div>
  );
}

/**
 * Main export with Suspense boundary for useSearchParams
 */
export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorContent />
    </Suspense>
  );
}

function EditorContent() {
  const searchParams = useSearchParams();

  // Parse URL params
  // - mode: 'page' or 'template'
  // - id: Finqu's stable page ID (for pages)
  // - type: Template type (for templates)
  // - slug: Template override slug (for templates only)
  // - locale: Current locale (REQUIRED - redirects if missing)
  const mode = (searchParams.get('mode') as EditorMode) || 'page';
  const urlPageId = searchParams.get('id'); // For pages - Finqu's stable page ID from URL
  const type = searchParams.get('type') as TemplateType | null;
  const slug = searchParams.get('slug'); // For template overrides only
  const urlLocale = searchParams.get('locale'); // Locale from URL (required)

  // Editor state
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isInherited, setIsInherited] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Resolved page ID - either from URL or homepage (fetched from API)
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(urlPageId);

  // Layout metadata for Puck (header/footer data)
  const [editorMetadata, setEditorMetadata] = useState<EditorMetadata | null>(null);

  // Store locales for language selector
  const [locales, setLocales] = useState<Locale[]>([]);

  // Default locale (first available from store)
  const [defaultLocale, setDefaultLocale] = useState<string>('en');

  // Pages list (controlled to support locale changes)
  const [pages, setPages] = useState<Page[]>([]);

  // Page not available in selected locale
  const [pageNotAvailable, setPageNotAvailable] = useState(false);

  // Phase 1: If no locale in URL, fetch store info and redirect with default locale
  useEffect(() => {
    if (urlLocale) return; // Already have locale, skip phase 1

    async function fetchAndRedirect() {
      try {
        // Fetch layout data which includes locales
        const res = await fetch('/api/layout/editor-data');
        if (!res.ok) throw new Error('Failed to fetch store info');

        const data = await res.json();
        const firstLocale = data.storeData.locales?.[0]?.isoCode;

        if (firstLocale) {
          // Redirect to same URL with locale param
          const params = new URLSearchParams(window.location.search);
          params.set('locale', firstLocale);
          window.location.href = `/editor?${params.toString()}`;
        } else {
          setError('No locales configured. Please check your Finqu store settings.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch store info:', err);
        setError('Failed to load store configuration.');
        setLoading(false);
      }
    }

    fetchAndRedirect();
  }, [urlLocale]);

  // Update resolved page ID when URL param changes
  useEffect(() => {
    if (urlPageId) {
      setResolvedPageId(urlPageId);
    }
  }, [urlPageId]);

  // Build API URL based on mode
  const getApiUrl = useCallback(
    (action?: 'publish' | 'reset') => {
      if (mode === 'page' && resolvedPageId) {
        // Pages use Finqu's stable page ID
        return `/api/puck/pages/${encodeURIComponent(resolvedPageId)}`;
      }
      if (mode === 'template' && type && isValidTemplateType(type)) {
        // Templates use type and optional slug for overrides
        let url = `/api/puck/templates/${type}`;
        if (slug) {
          url += `/${encodeURIComponent(slug)}`;
        }
        if (action === 'reset' && slug) {
          url += '/reset';
        }
        return url;
      }
      return null;
    },
    [mode, resolvedPageId, type, slug]
  );

  // Phase 2: Load initial data using locale from URL
  useEffect(() => {
    // Skip if no locale (Phase 1 will handle redirect)
    if (!urlLocale) return;

    async function loadData() {
      // Fetch layout data and pages list with locale
      try {
        const [layoutRes, pagesRes] = await Promise.all([
          fetch(`/api/layout/editor-data?locale=${urlLocale}`),
          fetch(`/api/puck/pages?locale=${urlLocale}`),
        ]);

        if (layoutRes.ok) {
          const layoutData = await layoutRes.json();
          const firstLocale = layoutData.storeData?.locales?.[0];

          setEditorMetadata({
            navbarMenu: layoutData.navbarMenu,
            footerMenu: layoutData.footerMenu,
            storeData: layoutData.storeData,
            layoutSettings: layoutData.layoutSettings,
            locale: urlLocale || undefined,
          });

          // Set locales from API response
          if (layoutData.storeData?.locales) {
            setLocales(layoutData.storeData.locales);
            setDefaultLocale(firstLocale?.isoCode || 'en');
          }
        }

        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          setPages(pagesData.pages || []);
          // Handle page mode without URL ID - load homepage by default
          if (mode === 'page' && !urlPageId) {
            const homepage = pagesData.pages?.find((p: { slug: string }) => p.slug === 'home');
            if (homepage?.id) {
              setResolvedPageId(homepage.id);
            } else {
              setError('Homepage not found. Please check your Finqu configuration.');
              setLoading(false);
              return;
            }
          }
        } else {
          if (mode === 'page' && !urlPageId) {
            setError('Failed to fetch pages list.');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load editor data.');
        setLoading(false);
        return;
      }

      // Handle new default template (no slug override)
      if (mode === 'template' && type && !slug) {
        // This is editing the default template - continue to fetch
      }
    }

    setLoading(true);
    setError(null);
    loadData();
  }, [mode, urlPageId, type, slug, urlLocale]);

  // Load page/template data when resolvedPageId is set
  useEffect(() => {
    async function loadPageData() {
      const url = getApiUrl();

      if (!url) {
        // Still waiting for resolved page ID or invalid config
        if (mode === 'page' && !resolvedPageId) {
          // Still resolving homepage ID - don't show error yet
          return;
        }
        if (mode === 'template' && !type) {
          setError('Invalid editor configuration. Please check the URL parameters.');
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch page/template data
        const pageRes = await fetch(`${url}?draft=true`);

        if (pageRes.status === 404) {
          // No existing data - start with empty
          setInitialData(emptyData);
          setLoading(false);
          return;
        }

        if (!pageRes.ok) {
          throw new Error('Failed to load data');
        }

        const json = await pageRes.json();
        setInitialData(json.data || emptyData);
        setIsInherited(json.meta?.isInherited || false);
        setHasOverride(json.meta?.hasOverride || false);
        setHasUnpublishedChanges(json.meta?.hasUnpublishedChanges || false);
      } catch (err) {
        console.error('Failed to load editor data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (resolvedPageId || (mode === 'template' && type)) {
      loadPageData();
    }
  }, [mode, resolvedPageId, type, slug, getApiUrl]);

  // Auto-save function
  const saveDraft = useCallback(
    async (data: Data) => {
      const url = getApiUrl();
      if (!url) return;

      setSaveStatus('saving');

      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw new Error('Failed to save');
        }

        setSaveStatus('saved');
        setHasUnpublishedChanges(true);

        // Reset status after a delay
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to save draft:', err);
        setSaveStatus('error');
      }
    },
    [getApiUrl]
  );

  // Debounced auto-save (2.5 second delay)
  const debouncedSave = useDebouncedCallback(saveDraft, 2500);

  // Handle data change (auto-save)
  const handleChange = useCallback(
    (data: Data) => {
      debouncedSave(data);
    },
    [debouncedSave]
  );

  // Publish function
  const handlePublish = useCallback(
    async (data: Data) => {
      const url = getApiUrl();
      if (!url) return;

      // Save draft first to ensure latest changes are saved
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        // Then publish
        const res = await fetch(url, {
          method: 'POST',
        });

        if (!res.ok) {
          throw new Error('Failed to publish');
        }

        setHasUnpublishedChanges(false);
        toast.success('Published successfully!');
      } catch (err) {
        console.error('Failed to publish:', err);
        toast.error('Failed to publish. Please try again.');
      }
    },
    [getApiUrl]
  );

  // Handle locale/language change - redirects to new URL
  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      if (newLocale === urlLocale) return;

      // Redirect to same URL with new locale param
      // This triggers a full refetch of all resources with the new locale
      const params = new URLSearchParams(window.location.search);
      params.set('locale', newLocale);
      window.location.href = `/editor?${params.toString()}`;
    },
    [urlLocale]
  );

  // Reset to default function (for template overrides)
  const handleResetToDefault = useCallback(async () => {
    if (!slug || mode !== 'template') return;

    const confirmed = confirm(
      'Are you sure you want to reset this template to the default? This will delete your custom changes.'
    );

    if (!confirmed) return;

    const url = getApiUrl('reset');
    if (!url) return;

    try {
      const res = await fetch(url, { method: 'POST' });

      if (!res.ok) {
        throw new Error('Failed to reset');
      }

      // Reload the page to get default template
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset:', err);
      toast.error('Failed to reset template. Please try again.');
    }
  }, [mode, slug, getApiUrl]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">{error}</div>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Render page not available state
  if (pageNotAvailable) {
    const currentLocaleInfo = locales.find((l) => l.isoCode === urlLocale);
    const firstLocale = locales[0];

    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-2 text-6xl">🌐</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Page not available</h2>
          <p className="mb-4 text-gray-600">
            This page is not available in{' '}
            <span className="font-medium">{currentLocaleInfo?.endonymName || urlLocale}</span>.
          </p>
          <p className="mb-6 text-sm text-gray-500">
            The page may not have been translated to this language yet.
          </p>
          {firstLocale && firstLocale.isoCode && firstLocale.isoCode !== urlLocale && (
            <button
              onClick={() => handleLocaleChange(firstLocale.isoCode!)}
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Switch to {firstLocale.endonymName}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Still loading or waiting for data
  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  // Guard: urlLocale must be set by this point (Phase 1 redirects if missing)
  if (!urlLocale) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Initializing locale...</div>
      </div>
    );
  }

  return (
    <LocaleProvider locale={urlLocale} defaultLocale={defaultLocale}>
      <div className="flex h-screen flex-col">
        {/* Puck editor with custom layout - header is inside to access context */}
        <div className="relative min-h-0 flex-1 [&>div]:h-full">
          <Puck
            config={editorConfig}
            data={initialData}
            onChange={handleChange}
            onPublish={handlePublish}
            metadata={editorMetadata ?? undefined}
            ui={{
              leftSideBarVisible: false,
              viewports: {
                current: {
                  width: '100%',
                  height: 'auto',
                },
                controlsVisible: true,
                options: defaultViewports,
              },
            }}
            viewports={defaultViewports}
          >
            <EditorLayout
              mode={mode}
              type={type}
              pageId={resolvedPageId}
              slug={slug}
              hasUnpublishedChanges={hasUnpublishedChanges}
              isInherited={isInherited}
              hasOverride={hasOverride}
              saveStatus={saveStatus}
              locales={locales}
              currentLocale={urlLocale}
              pages={pages}
              onResetToDefault={handleResetToDefault}
              onLanguageChange={handleLocaleChange}
              onPublishData={handlePublish}
            />
          </Puck>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </LocaleProvider>
  );
}

/**
 * Editor layout component that lives inside Puck context
 */
interface EditorLayoutProps {
  mode: 'page' | 'template';
  type?: TemplateType | null;
  pageId?: string | null;
  slug?: string | null;
  hasUnpublishedChanges: boolean;
  isInherited: boolean;
  hasOverride: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  locales: Locale[];
  currentLocale: string;
  pages: Page[];
  onResetToDefault: () => void;
  onLanguageChange: (locale: string) => void;
  onPublishData: (data: Data) => Promise<void>;
}

function EditorLayout({
  mode,
  type,
  pageId,
  slug,
  hasUnpublishedChanges,
  isInherited,
  hasOverride,
  saveStatus,
  locales,
  currentLocale,
  pages,
  onResetToDefault,
  onLanguageChange,
  onPublishData,
}: EditorLayoutProps) {
  // Use selector to only subscribe to data changes (for publish)
  const data = usePuck((s) => s.appState?.data);

  // Handle publish by calling the parent's publish function with current data
  const handlePublish = () => {
    if (data) {
      onPublishData(data);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Editor Toolbar */}
      <EditorToolbar
        mode={mode}
        type={type}
        pageId={pageId}
        slug={slug}
        hasUnpublishedChanges={hasUnpublishedChanges}
        isInherited={isInherited}
        hasOverride={hasOverride}
        saveStatus={saveStatus}
        locales={locales}
        currentLocale={currentLocale}
        pages={pages}
        onPublish={handlePublish}
        onLanguageChange={onLanguageChange}
      />

      {/* Reset to default button (only for template overrides) */}
      {mode === 'template' && slug && (hasOverride || hasUnpublishedChanges) && (
        <div className="flex items-center justify-end border-b bg-white px-4 py-1.5">
          <button
            onClick={onResetToDefault}
            className="rounded-sm border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
          >
            Reset to Default
          </button>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar with tabs for Components/Outline */}
        <div className="flex w-[280px] shrink-0 flex-col border-r bg-white">
          <Tabs defaultValue="components" className="flex h-full flex-col">
            <TabsList className="mx-2 mt-2 shrink-0">
              <TabsTrigger value="components" className="text-xs">
                Components
              </TabsTrigger>
              <TabsTrigger value="outline" className="text-xs">
                Outline
              </TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="min-h-0 flex-1 overflow-y-auto p-2">
              <Puck.Components />
            </TabsContent>
            <TabsContent value="outline" className="min-h-0 flex-1 overflow-y-auto p-2">
              <Puck.Outline />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          <div className="flex-1 overflow-auto p-4">
            <PreviewWithViewport />
          </div>
        </div>

        {/* Right sidebar - Fields */}
        <div className="w-[280px] shrink-0 overflow-y-auto border-l bg-white">
          <Puck.Fields />
        </div>
      </div>
    </div>
  );
}
