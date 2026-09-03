import { getStorage } from './storage';

const storage = getStorage();

/**
 * Layout settings for navbar and footer
 */
export interface LayoutSettings {
  navbar: {
    menuHandle: string;
  };
  footer: {
    menuHandle: string;
    tagline: string;
    copyrightText: string;
    twitterUrl: string;
    facebookUrl: string;
    linkedinUrl: string;
  };
}

/**
 * Default layout settings
 */
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  navbar: {
    menuHandle: 'main',
  },
  footer: {
    menuHandle: 'footer',
    tagline: 'Building solutions for businesses and individuals around the globe.',
    copyrightText: '© {year} {storeName}. All rights reserved.',
    twitterUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
  },
};

const STORAGE_KEY = 'layout:settings';

/**
 * Get layout settings from storage
 * Falls back to defaults if not found
 */
export async function getLayoutSettings(): Promise<LayoutSettings> {
  try {
    const settings = await storage.get<LayoutSettings>(STORAGE_KEY);
    if (settings) {
      // Merge with defaults to ensure all fields exist
      return {
        navbar: { ...DEFAULT_LAYOUT_SETTINGS.navbar, ...settings.navbar },
        footer: { ...DEFAULT_LAYOUT_SETTINGS.footer, ...settings.footer },
      };
    }
  } catch (error) {
    console.error('Failed to get layout settings:', error);
  }
  return DEFAULT_LAYOUT_SETTINGS;
}

/**
 * Update layout settings in storage
 */
export async function updateLayoutSettings(
  settings: Partial<LayoutSettings>
): Promise<LayoutSettings> {
  const current = await getLayoutSettings();
  const updated: LayoutSettings = {
    navbar: { ...current.navbar, ...settings.navbar },
    footer: { ...current.footer, ...settings.footer },
  };
  await storage.set(STORAGE_KEY, updated);
  return updated;
}
