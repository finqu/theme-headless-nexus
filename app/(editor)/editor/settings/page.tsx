'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LayoutSettings } from '@/lib/layout-settings';

interface MenuOption {
  handle: string;
  title: string;
}

export default function SettingsEditorPage() {
  const [settings, setSettings] = useState<LayoutSettings | null>(null);
  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch settings and menus on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, menusRes] = await Promise.all([
          fetch('/api/layout/settings'),
          fetch('/api/layout/menus'),
        ]);

        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }
        if (menusRes.ok) {
          setMenus(await menusRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/layout/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container py-8">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Layout Settings</h1>
          <p className="text-muted-foreground">Configure your site&apos;s header and footer</p>
        </div>
        <Link href="/editor">
          <Button variant="outline">← Back to Editor</Button>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-sm p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Navbar Settings */}
        <section className="space-y-4">
          <h2 className="border-b pb-2 text-lg font-semibold">Navigation Bar</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Menu</label>
            <select
              value={settings.navbar.menuHandle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  navbar: { ...settings.navbar, menuHandle: e.target.value },
                })
              }
              className="border-input bg-background w-full rounded-sm border px-3 py-2 text-sm"
            >
              <option value="">Select a menu...</option>
              {menus.map((menu) => (
                <option key={menu.handle} value={menu.handle}>
                  {menu.title} ({menu.handle})
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              Select which menu to display in the navigation bar
            </p>
          </div>
        </section>

        {/* Footer Settings */}
        <section className="space-y-4">
          <h2 className="border-b pb-2 text-lg font-semibold">Footer</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Menu</label>
            <select
              value={settings.footer.menuHandle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, menuHandle: e.target.value },
                })
              }
              className="border-input bg-background w-full rounded-sm border px-3 py-2 text-sm"
            >
              <option value="">Select a menu...</option>
              {menus.map((menu) => (
                <option key={menu.handle} value={menu.handle}>
                  {menu.title} ({menu.handle})
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              Select which menu to display in the footer columns
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input
              value={settings.footer.tagline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, tagline: e.target.value },
                })
              }
              placeholder="Your company tagline..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Copyright Text</label>
            <Input
              value={settings.footer.copyrightText}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, copyrightText: e.target.value },
                })
              }
              placeholder="© {year} {storeName}. All rights reserved."
            />
            <p className="text-muted-foreground text-xs">
              Use {'{year}'} for current year and {'{storeName}'} for store name
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Twitter/X URL</label>
              <Input
                value={settings.footer.twitterUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, twitterUrl: e.target.value },
                  })
                }
                placeholder="https://x.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facebook URL</label>
              <Input
                value={settings.footer.facebookUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, facebookUrl: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                value={settings.footer.linkedinUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, linkedinUrl: e.target.value },
                  })
                }
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="border-t pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
