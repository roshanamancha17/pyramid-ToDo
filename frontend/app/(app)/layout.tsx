'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { Sidebar } from '@/components/Sidebar';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const { setOpen } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>;
  }
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {/* Mobile top bar — hidden on desktop where the sidebar is always visible */}
        <div className="md:hidden sticky top-0 z-20 bg-surface border-b border-border px-4 h-12 flex items-center">
          <button
            onClick={() => setOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 font-medium text-sm">Pyramid</span>
        </div>
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}
