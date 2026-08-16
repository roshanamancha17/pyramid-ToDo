'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, User as UserIcon, Sun, Palette } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { api } from '@/lib/api';
import clsx from 'clsx';

const COLOR_SWATCHES = [
  { value: 'AMBER', label: 'Amber', hex: '#F59E0B' },
  { value: 'BLUE', label: 'Blue', hex: '#6366F1' },
  { value: 'PINK', label: 'Pink', hex: '#EC4899' },
  { value: 'ROSE', label: 'Rose', hex: '#F43F5E' },
  { value: 'EMERALD', label: 'Emerald', hex: '#10B981' },
  { value: 'BLACK', label: 'Black', hex: '#171717' },
] as const;

type Section = 'profile' | 'theme' | 'color';

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser, themeMode, colorMode, setThemeMode, setColorMode } = useApp();
  const [section, setSection] = useState<Section>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      await api.patch('/users/me', { name, title, username });
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  async function leaveWorkspace() {
    if (!confirm('Remove yourself from the workspace? This cannot be undone.')) return;
    await api.delete('/users/me');
    router.push('/login');
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <aside className="w-full lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r border-border p-4">
        <button
          onClick={() => router.push('/tasks')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </button>

        <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border text-sm text-muted mb-4">
          <Search className="h-3.5 w-3.5" />
          Search
        </div>

        <nav className="space-y-0.5">
          <SectionRow icon={<UserIcon className="h-4 w-4" />} label="Profile" active={section === 'profile'} onClick={() => setSection('profile')} />
          <SectionRow icon={<Sun className="h-4 w-4" />} label="Theme" active={section === 'theme'} onClick={() => setSection('theme')} />
          <SectionRow icon={<Palette className="h-4 w-4" />} label="Color" active={section === 'color'} onClick={() => setSection('color')} />
        </nav>
      </aside>

      <div className="flex-1 p-4 md:p-8 lg:max-w-2xl">
        {section === 'profile' && (
          <>
            <h1 className="text-xl font-semibold mb-5">Profile</h1>
            <div className="border border-border rounded-xl divide-y divide-border">
              <FieldRow label="Profile picture">
                <div className="h-9 w-9 rounded-full bg-accent" />
              </FieldRow>
              <FieldRow label="Email">
                <div className="flex items-center gap-2 text-muted">{user?.email}</div>
              </FieldRow>
              <FieldRow label="Full name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveProfile}
                  className="h-9 w-36 sm:w-52 rounded-lg border border-border px-3 text-sm bg-surface-2 outline-none focus:border-accent text-right"
                />
              </FieldRow>
              <FieldRow label="Title" hint="Your job title or role">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveProfile}
                  className="h-9 w-36 sm:w-52 rounded-lg border border-border px-3 text-sm bg-surface-2 outline-none focus:border-accent text-right"
                />
              </FieldRow>
              <FieldRow label="Username" hint="One word, like a nickname or first name">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={saveProfile}
                  className="h-9 w-36 sm:w-52 rounded-lg border border-border px-3 text-sm bg-surface-2 outline-none focus:border-accent text-right"
                />
              </FieldRow>
            </div>
            {saving && <p className="text-xs text-muted mt-2">Saving…</p>}

            <h2 className="text-sm font-medium mt-8 mb-2">Workspace access</h2>
            <div className="border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm">Remove yourself from the workspace</p>
              </div>
              <button
                onClick={leaveWorkspace}
                className="h-8 px-3 rounded-lg text-sm border border-red-200 text-red-500 hover:bg-red-50"
              >
                Leave Workspace
              </button>
            </div>
          </>
        )}

        {section === 'theme' && (
          <>
            <h1 className="text-xl font-semibold mb-5">Theme</h1>
            <div className="flex gap-4">
              {(['LIGHT', 'DARK'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className={clsx(
                    'w-40 rounded-xl border-2 p-3 text-left transition',
                    themeMode === mode ? 'border-accent' : 'border-border',
                  )}
                >
                  <div
                    className={clsx(
                      'h-20 rounded-lg mb-2',
                      mode === 'LIGHT' ? 'bg-white border border-border' : 'bg-zinc-900',
                    )}
                  />
                  <p className="text-sm font-medium">{mode === 'LIGHT' ? 'Light' : 'Dark'}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {section === 'color' && (
          <>
            <h1 className="text-xl font-semibold mb-5">Color</h1>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColorMode(c.value)}
                  className={clsx(
                    'rounded-xl border-2 p-3 flex items-center gap-2 transition',
                    colorMode === c.value ? 'border-accent' : 'border-border',
                  )}
                >
                  <span className="h-5 w-5 rounded-full" style={{ background: c.hex }} />
                  <span className="text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm',
        active ? 'bg-surface-2 font-medium' : 'hover:bg-surface-2 text-foreground/80',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
