import type { Config, DefaultRootRenderProps, PuckContext } from '@puckeditor/core';
import type { StoreInfo } from '@finqu/storefront-lib/server';
import { config as baseConfig } from '@/.storefront/puck.render.config';
import { NavbarClient } from '@/components/layout/navbar-client';
import { FooterClient } from '@/components/layout/footer-client';
import type { MenuWithLinks } from '@/lib/menu-queries';
import type { LayoutSettings } from '@/lib/layout-settings';
import type { ReactNode } from 'react';

/**
 * Metadata passed to the Puck editor containing layout data
 */
export interface EditorMetadata {
  navbarMenu: MenuWithLinks | null;
  footerMenu: MenuWithLinks | null;
  storeInfo: StoreInfo;
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

      const { navbarMenu, footerMenu, storeInfo, layoutSettings } = metadata;

      return (
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <NavbarClient menu={navbarMenu} storeInfo={storeInfo} isEditing={isEditing} />

          {/* Main content area - where Puck components are rendered */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <FooterClient
            menu={footerMenu}
            storeName={storeInfo.name ?? undefined}
            logoUrl={storeInfo.logo ?? undefined}
            tagline={layoutSettings.footer.tagline}
            copyrightText={layoutSettings.footer.copyrightText}
            twitterUrl={layoutSettings.footer.twitterUrl}
            facebookUrl={layoutSettings.footer.facebookUrl}
            linkedinUrl={layoutSettings.footer.linkedinUrl}
            isEditing={isEditing}
          />
        </div>
      );
    },
  },
};
