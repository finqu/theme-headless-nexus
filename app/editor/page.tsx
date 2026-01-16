'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Puck, type Data } from '@puckeditor/core';
import { config } from '@/.storefront/puck.edit.config';
import '@puckeditor/core/puck.css';
import {
  TEMPLATE_TYPES,
  TEMPLATE_TYPE_LABELS,
  isValidTemplateType,
  type TemplateType,
} from '@/lib/template-types';

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
  const mode = (searchParams.get('mode') as EditorMode) || 'page';
  const type = searchParams.get('type') as TemplateType | null;
  const slug = searchParams.get('slug');

  // Editor state
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isInherited, setIsInherited] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Build API URL based on mode
  const getApiUrl = useCallback(
    (action?: 'publish' | 'reset') => {
      if (mode === 'page' && slug) {
        return `/api/puck/pages/${encodeURIComponent(slug)}`;
      }
      if (mode === 'template' && type && isValidTemplateType(type)) {
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
    [mode, type, slug]
  );

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const url = getApiUrl();

      // Handle new page/template (no slug for pages)
      if (mode === 'page' && !slug) {
        setInitialData(emptyData);
        setLoading(false);
        return;
      }

      // Handle new default template
      if (mode === 'template' && type && !slug) {
        // This is editing the default template
      }

      if (!url) {
        setError('Invalid editor configuration. Please check the URL parameters.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${url}?draft=true`);

        if (res.status === 404) {
          // No existing data - start with empty
          setInitialData(emptyData);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load data');
        }

        const json = await res.json();
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

    setLoading(true);
    setError(null);
    loadData();
  }, [mode, type, slug, getApiUrl]);

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
        alert('Published successfully!');
      } catch (err) {
        console.error('Failed to publish:', err);
        alert('Failed to publish. Please try again.');
      }
    },
    [getApiUrl]
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
      alert('Failed to reset template. Please try again.');
    }
  }, [mode, slug, getApiUrl]);

  // Build editor title
  const getEditorTitle = () => {
    if (mode === 'page') {
      return slug ? `Editing Page: ${slug}` : 'New Page';
    }
    if (mode === 'template' && type) {
      const typeLabel = TEMPLATE_TYPE_LABELS[type] || type;
      if (slug) {
        return `${typeLabel} Template: ${slug}`;
      }
      return `Default ${typeLabel} Template`;
    }
    return 'Editor';
  };

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
          <a href="/editor" className="mt-4 text-blue-600 underline">
            Go to editor home
          </a>
        </div>
      </div>
    );
  }

  // Render editor selection if no valid params
  if (!initialData) {
    return <EditorHome />;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium">{getEditorTitle()}</h1>

          {/* Inheritance indicator */}
          {isInherited && (
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              Using default template
            </span>
          )}

          {/* Save status */}
          <span
            className={`text-xs ${saveStatus === 'saving' ? 'text-gray-500' : saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-gray-400'}`}
          >
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Draft saved'}
            {saveStatus === 'error' && 'Save failed'}
          </span>

          {/* Unpublished changes indicator */}
          {hasUnpublishedChanges && (
            <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
              Unpublished changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Reset to default button (only for template overrides) */}
          {mode === 'template' && slug && (hasOverride || hasUnpublishedChanges) && (
            <button
              onClick={handleResetToDefault}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            >
              Reset to Default
            </button>
          )}
        </div>
      </div>

      {/* Puck editor */}
      <div className="flex-1">
        <Puck
          config={config}
          data={initialData}
          onChange={handleChange}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}

/**
 * Editor home page when no valid params are provided
 */
function EditorHome() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Puck Editor</h1>

        {/* Pages section */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Pages</h2>
          <div className="rounded-lg border bg-white p-6">
            <p className="mb-4 text-gray-600">
              Create and edit static pages like About, Contact, etc.
            </p>
            <div className="flex gap-4">
              <a
                href="/editor?mode=page&slug=home"
                className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90"
              >
                Edit Home Page
              </a>
              <a href="/api/puck/pages" className="rounded border px-4 py-2 hover:bg-gray-50">
                View All Pages
              </a>
            </div>
          </div>
        </section>

        {/* Templates section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Templates</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {TEMPLATE_TYPES.map((templateType) => (
              <div key={templateType} className="rounded-lg border bg-white p-6">
                <h3 className="mb-2 font-medium">{TEMPLATE_TYPE_LABELS[templateType]}</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Default template for {templateType} pages
                </p>
                <div className="flex gap-2">
                  <a
                    href={`/editor?mode=template&type=${templateType}`}
                    className="bg-primary text-primary-foreground rounded px-3 py-1 text-sm hover:opacity-90"
                  >
                    Edit Default
                  </a>
                  <a
                    href={`/api/puck/templates/${templateType}/overrides`}
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    View Overrides
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
