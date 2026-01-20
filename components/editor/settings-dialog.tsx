'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LayoutSettings } from '@/lib/layout-settings';

interface MenuOption {
  handle: string;
  title: string;
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<LayoutSettings | null>(null);
  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch settings and menus when dialog opens
  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      setLoading(true);
      setMessage(null);
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
  }, [open]);

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
        // Auto-close after a brief delay on success
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
          title="Layout Settings"
        >
          Settings
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Layout Settings</DialogTitle>
          <DialogDescription>
            Configure your site&apos;s header and footer settings
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-sm text-muted-foreground">Loading settings...</div>
          </div>
        ) : !settings ? (
          <div className="py-8 text-center text-sm text-red-500">Failed to load settings</div>
        ) : (
          <>
            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === 'success'
                    ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <Tabs defaultValue="navbar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="navbar">Navigation</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
              </TabsList>

              {/* Navigation Tab */}
              <TabsContent value="navbar" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="navbar-menu" className="text-sm font-medium">Menu</label>
                  <select
                    id="navbar-menu"
                    value={settings.navbar.menuHandle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        navbar: { ...settings.navbar, menuHandle: e.target.value },
                      })
                    }
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Select a menu...</option>
                    {menus.map((menu) => (
                      <option key={menu.handle} value={menu.handle}>
                        {menu.title} ({menu.handle})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Select which menu to display in the navigation bar
                  </p>
                </div>
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="footer-menu" className="text-sm font-medium">Menu</label>
                  <select
                    id="footer-menu"
                    value={settings.footer.menuHandle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, menuHandle: e.target.value },
                      })
                    }
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Select a menu...</option>
                    {menus.map((menu) => (
                      <option key={menu.handle} value={menu.handle}>
                        {menu.title} ({menu.handle})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground">
                    Use {'{year}'} for current year and {'{storeName}'} for store name
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Social Links</label>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Twitter/X</label>
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

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Facebook</label>
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

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">LinkedIn</label>
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
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
