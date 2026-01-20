import type { Data } from '@puckeditor/core';
import { getStorage } from './storage';
import { TemplateType, isValidTemplateType } from './template-types';

/**
 * Version type for Puck configs
 */
export type ConfigVersion = 'draft' | 'published';

/**
 * Key generators for storage
 */
export const puckKeys = {
  /**
   * Key for a page layout config.
   * Uses Finqu's stable page ID (not the localized URL slug) to ensure
   * the same layout is used across all language versions of a page.
   *
   * @param pageId - Finqu's stable page ID (e.g., "123", "abc-def")
   * @param version - draft or published
   */
  page: (pageId: string, version: ConfigVersion) => `page:${pageId}:${version}`,

  /**
   * Key for a default template (used when no slug-specific override exists)
   */
  templateDefault: (type: TemplateType, version: ConfigVersion) =>
    `template:${type}:default:${version}`,

  /**
   * Key for a slug-specific template override
   */
  templateSlug: (type: TemplateType, slug: string, version: ConfigVersion) =>
    `template:${type}:slug:${slug}:${version}`,
};

// ============================================================================
// Page Operations
// ============================================================================

/**
 * Get a page config by Finqu page ID.
 * Uses the stable page ID (not URL slug) to ensure consistent layouts across localized routes.
 *
 * @param pageId - Finqu's stable page ID
 * @param version - Which version to get ("draft" or "published")
 */
export async function getPageConfig(
  pageId: string,
  version: ConfigVersion = 'published'
): Promise<Data | null> {
  const storage = getStorage();
  return storage.get<Data>(puckKeys.page(pageId, version));
}

/**
 * Save a page config as draft
 * @param pageId - Finqu's stable page ID
 * @param data - Puck editor data
 */
export async function savePageDraft(pageId: string, data: Data): Promise<void> {
  const storage = getStorage();
  await storage.set(puckKeys.page(pageId, 'draft'), data);
}

/**
 * Publish a page (copy draft to published)
 * @param pageId - Finqu's stable page ID
 * @returns true if published successfully, false if no draft exists
 */
export async function publishPage(pageId: string): Promise<boolean> {
  const storage = getStorage();
  const draft = await storage.get<Data>(puckKeys.page(pageId, 'draft'));

  if (!draft) {
    return false;
  }

  await storage.set(puckKeys.page(pageId, 'published'), draft);
  return true;
}

/**
 * Delete a page (both draft and published)
 * @param pageId - Finqu's stable page ID
 */
export async function deletePage(pageId: string): Promise<void> {
  const storage = getStorage();
  await storage.delete(puckKeys.page(pageId, 'draft'));
  await storage.delete(puckKeys.page(pageId, 'published'));
}

/**
 * List all page IDs that have Puck configs stored
 * @returns Array of Finqu page IDs
 */
export async function listPageIds(): Promise<string[]> {
  const storage = getStorage();
  const keys = await storage.keys('page:*:published');

  return keys.map((key) => {
    // Extract pageId from "page:{pageId}:published"
    const parts = key.split(':');
    return parts[1];
  });
}

/**
 * Check if a page has unpublished changes
 * @param pageId - Finqu's stable page ID
 */
export async function hasPageUnpublishedChanges(pageId: string): Promise<boolean> {
  const storage = getStorage();

  const draft = await storage.get<Data>(puckKeys.page(pageId, 'draft'));
  const published = await storage.get<Data>(puckKeys.page(pageId, 'published'));

  if (!draft) return false;
  if (!published) return true;

  // Simple comparison - in production might want deep comparison
  return JSON.stringify(draft) !== JSON.stringify(published);
}

// ============================================================================
// Template Operations
// ============================================================================

/**
 * Get a template config with fallback chain:
 * 1. Try slug-specific override (if slug provided)
 * 2. Fall back to default template
 *
 * @param type - Template type (e.g., "product", "category")
 * @param slug - Optional slug for per-item override
 * @param version - Which version to get
 */
export async function getTemplateConfig(
  type: TemplateType,
  slug?: string,
  version: ConfigVersion = 'published'
): Promise<Data | null> {
  const storage = getStorage();

  // Try slug-specific override first
  if (slug) {
    const override = await storage.get<Data>(puckKeys.templateSlug(type, slug, version));
    if (override) {
      return override;
    }
  }

  // Fall back to default template
  return storage.get<Data>(puckKeys.templateDefault(type, version));
}

/**
 * Get a template draft for editing
 * If editing a slug override that doesn't exist, clone from default template
 *
 * @param type - Template type
 * @param slug - Optional slug for per-item override
 * @returns Object with data and metadata about whether it's inherited
 */
export async function getTemplateDraft(
  type: TemplateType,
  slug?: string
): Promise<{ data: Data | null; isInherited: boolean; hasOverride: boolean }> {
  const storage = getStorage();

  if (slug) {
    // Check if a slug-specific override exists
    const override = await storage.get<Data>(puckKeys.templateSlug(type, slug, 'draft'));

    if (override) {
      return { data: override, isInherited: false, hasOverride: true };
    }

    // Check if published override exists (user edited before)
    const publishedOverride = await storage.get<Data>(
      puckKeys.templateSlug(type, slug, 'published')
    );

    if (publishedOverride) {
      // Copy published to draft for editing
      return { data: publishedOverride, isInherited: false, hasOverride: true };
    }

    // No override - clone from default template
    const defaultTemplate = await storage.get<Data>(puckKeys.templateDefault(type, 'draft'));

    if (!defaultTemplate) {
      // Try published default
      const publishedDefault = await storage.get<Data>(puckKeys.templateDefault(type, 'published'));
      return { data: publishedDefault, isInherited: true, hasOverride: false };
    }

    return { data: defaultTemplate, isInherited: true, hasOverride: false };
  }

  // Getting default template draft
  const draft = await storage.get<Data>(puckKeys.templateDefault(type, 'draft'));

  if (draft) {
    return { data: draft, isInherited: false, hasOverride: false };
  }

  // Fall back to published
  const published = await storage.get<Data>(puckKeys.templateDefault(type, 'published'));
  return { data: published, isInherited: false, hasOverride: false };
}

/**
 * Save a template draft
 * @param type - Template type
 * @param data - Puck editor data
 * @param slug - Optional slug for per-item override
 */
export async function saveTemplateDraft(
  type: TemplateType,
  data: Data,
  slug?: string
): Promise<void> {
  const storage = getStorage();

  if (slug) {
    await storage.set(puckKeys.templateSlug(type, slug, 'draft'), data);
  } else {
    await storage.set(puckKeys.templateDefault(type, 'draft'), data);
  }
}

/**
 * Publish a template (copy draft to published)
 * @param type - Template type
 * @param slug - Optional slug for per-item override
 * @returns true if published successfully
 */
export async function publishTemplate(type: TemplateType, slug?: string): Promise<boolean> {
  const storage = getStorage();

  const draftKey = slug
    ? puckKeys.templateSlug(type, slug, 'draft')
    : puckKeys.templateDefault(type, 'draft');

  const publishedKey = slug
    ? puckKeys.templateSlug(type, slug, 'published')
    : puckKeys.templateDefault(type, 'published');

  const draft = await storage.get<Data>(draftKey);

  if (!draft) {
    return false;
  }

  await storage.set(publishedKey, draft);
  return true;
}

/**
 * Reset a slug override to default template
 * Deletes both draft and published versions of the override
 *
 * @param type - Template type
 * @param slug - Slug to reset
 */
export async function resetTemplateOverride(type: TemplateType, slug: string): Promise<void> {
  const storage = getStorage();
  await storage.delete(puckKeys.templateSlug(type, slug, 'draft'));
  await storage.delete(puckKeys.templateSlug(type, slug, 'published'));
}

/**
 * List all slug overrides for a template type
 * @param type - Template type
 * @returns Array of slugs that have overrides
 */
export async function listTemplateOverrides(type: TemplateType): Promise<string[]> {
  const storage = getStorage();
  const pattern = `template:${type}:slug:*:published`;
  const keys = await storage.keys(pattern);

  return keys.map((key) => {
    // Extract slug from "template:{type}:slug:{slug}:published"
    const parts = key.split(':');
    return parts[3];
  });
}

/**
 * Check if a template has unpublished changes
 * @param type - Template type
 * @param slug - Optional slug for per-item override
 */
export async function hasUnpublishedChanges(type: TemplateType, slug?: string): Promise<boolean> {
  const storage = getStorage();

  const draftKey = slug
    ? puckKeys.templateSlug(type, slug, 'draft')
    : puckKeys.templateDefault(type, 'draft');

  const publishedKey = slug
    ? puckKeys.templateSlug(type, slug, 'published')
    : puckKeys.templateDefault(type, 'published');

  const draft = await storage.get<Data>(draftKey);
  const published = await storage.get<Data>(publishedKey);

  if (!draft) return false;
  if (!published) return true;

  // Simple comparison - in production might want deep comparison
  return JSON.stringify(draft) !== JSON.stringify(published);
}
