'use client';

import type { Config, DefaultRootRenderProps, PuckContext } from '@puckeditor/core';
import { config as baseConfig } from '@/.storefront/puck.edit.config';
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
  storeName: string;
  logoUrl?: string;
  layoutSettings: LayoutSettings;
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

      const { navbarMenu, footerMenu, storeName, logoUrl, layoutSettings } = metadata;

      return (
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <NavbarClient
            menu={navbarMenu}
            storeName={storeName}
            logoUrl={logoUrl}
            isEditing={isEditing}
          />

          {/* Main content area - where Puck components are rendered */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <FooterClient
            menu={footerMenu}
            storeName={storeName}
            logoUrl={logoUrl}
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
