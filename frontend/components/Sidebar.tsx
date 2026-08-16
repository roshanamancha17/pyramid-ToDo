'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, FolderKanban, ChevronsUpDown, Sun, Moon, Settings, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useSidebar } from '@/lib/sidebar-context';
import clsx from 'clsx';

const COLOR_SWATCHES: { value: string; label: string; hex: string }[] = [
  { value: 'AMBER', label: 'Amber', hex: '#F59E0B' },
  { value: 'BLUE', label: 'Blue', hex: '#6366F1' },
  { value: 'PINK', label: 'Pink', hex: '#EC4899' },
  { value: 'ROSE', label: 'Rose', hex: '#F43F5E' },
  { value: 'EMERALD', label: 'Emerald', hex: '#10B981' },
  { value: 'BLACK', label: 'Black', hex: '#171717' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, themeMode, colorMode, setThemeMode, setColorMode, logout } = useApp();
  const { open, setOpen } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'theme' | 'color' | null>(null);

  const nav = [
    { href: '/tasks', label: 'Tasks', icon: LayoutGrid },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
  ];

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <aside
        className={clsx(
          'w-60 shrink-0 border-r border-border h-screen flex flex-col bg-surface z-40',
          'fixed top-0 left-0 transition-transform md:sticky md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative p-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMenuOpen((v) => !v);
                setSubmenu(null);
              }}
              className="flex-1 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-surface-2 transition min-w-0"
            >
              <div className="h-7 w-7 rounded-full bg-accent shrink-0" />
              <span className="font-medium truncate">{user?.name ?? 'Guest'}</span>
              <ChevronsUpDown className="h-4 w-4 text-muted ml-auto shrink-0" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden h-9 w-9 shrink-0 flex items-center justify-center rounded-lg hover:bg-surface-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {menuOpen && (
            <div className="absolute left-3 top-14 z-20 w-56 bg-surface border border-border rounded-xl shadow-lg py-3 px-3">
              <div className="flex items-center gap-2 pb-3 border-b border-border mb-2">
                <div className="h-9 w-9 rounded-full bg-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name ?? 'Guest'}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
              </div>

              <MenuRow
                icon={<Sun className="h-4 w-4" />}
                label="Change Theme"
                onClick={() => setSubmenu(submenu === 'theme' ? null : 'theme')}
                expanded={submenu === 'theme'}
              />
              {submenu === 'theme' && (
                <div className="ml-6 mb-1">
                  {(['LIGHT', 'DARK'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setThemeMode(mode)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-surface-2"
                    >
                      {mode === 'LIGHT' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                      {mode === 'LIGHT' ? 'Light' : 'Dark'}
                      {themeMode === mode && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <MenuRow
                icon={<span className="h-3.5 w-3.5 rounded-sm bg-accent inline-block" />}
                label="Color Mode"
                onClick={() => setSubmenu(submenu === 'color' ? null : 'color')}
                expanded={submenu === 'color'}
              />
              {submenu === 'color' && (
                <div className="ml-6 mb-1">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColorMode(c.value as never)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-surface-2"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-sm inline-block"
                        style={{ background: c.hex }}
                      />
                      {c.label}
                      {colorMode === c.value && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <MenuRow
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              />

              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-surface-2 text-red-500 mt-1"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <div className="px-3 pb-2">
          <p className="px-2 text-xs font-medium text-muted uppercase tracking-wide">Workspace</p>
        </div>

        <nav className="px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition text-left',
                  active ? 'bg-surface-2 font-medium' : 'hover:bg-surface-2 text-foreground/80',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
  expanded,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-surface-2"
    >
      {icon}
      {label}
      <span className="ml-auto text-muted">{expanded ? '▾' : '▸'}</span>
    </button>
  );
}
