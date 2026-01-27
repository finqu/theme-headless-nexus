import type { Config, DefaultRootRenderProps, PuckContext } from '@puckeditor/core';
import type { Menu } from '@finqu/storefront-types';
import type { StoreData, StoreBasicInfo } from '@/lib/context-providers/store-context';
import { config as baseConfig } from '@/.storefront/puck.edit.config';
import { NavbarClient } from '@/components/layout/navbar-client';
import { Footer } from '@/components/layout/footer';
import type { LayoutSettings } from '@/lib/layout-settings';
import type { ReactNode } from 'react';

/**
 * Metadata passed to the Puck editor containing layout data
 */
export interface EditorMetadata {
  navbarMenu: Menu | null;
  footerMenu: Menu | null;
  storeData: StoreData;
  layoutSettings: LayoutSettings;
  /** Current locale/language code (e.g., 'fi', 'en') for fetching localized content */
  locale?: string;
}

/**
 * Extended Puck config that wraps the auto-generated config
 * and adds a root property for header/footer rendering
 */
export const editorConfig: Config = {
  ...baseConfig,
  root: {
    render: ({ children, puck }: { children: ReactNode; puck: PuckContext }) => {
      const { isEditing } = puck;
      // Access metadata from puck context - it's passed via the metadata prop
      const metadata = (puck as unknown as { metadata?: EditorMetadata }).metadata;

      // If no metadata provided, just render children (fallback)
      if (!metadata) {
        return <>{children}</>;
      }

      const { navbarMenu, footerMenu, storeData, layoutSettings } = metadata;

      // Wrap footer in a handler to capture clicks when editing
      // This prevents navigation when clicking footer links in the editor
      const handleFooterClick = (e: React.MouseEvent) => {
        if (isEditing) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      return (
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <NavbarClient menu={navbarMenu} storeData={storeData} isEditing={isEditing} />

          {/* Main content area - where Puck components are rendered */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <div onClickCapture={handleFooterClick}>
            <Footer
              menu={footerMenu}
              storeData={storeData}
              tagline={layoutSettings.footer.tagline}
              copyrightText={layoutSettings.footer.copyrightText}
              twitterUrl={layoutSettings.footer.twitterUrl}
              facebookUrl={layoutSettings.footer.facebookUrl}
              linkedinUrl={layoutSettings.footer.linkedinUrl}
              isEditing={isEditing}
            />
          </div>
        </div>
      );
    },
  },
};
