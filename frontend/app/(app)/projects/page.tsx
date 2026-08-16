'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';
import { PriorityBadge } from '@/components/Badges';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    api
      .get<Project[]>('/projects')
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const project = await api.post<Project>('/projects', { name });
    setProjects((prev) => [project, ...prev]);
    setName('');
    setCreating(false);
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Projects</h1>
        <button
          onClick={() => setCreating(true)}
          className="h-9 px-3 rounded-lg bg-foreground text-surface text-sm font-medium flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Project
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="flex items-center gap-2 mb-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="h-9 w-64 rounded-lg border border-border px-3 text-sm bg-transparent outline-none focus:border-accent"
          />
          <button type="submit" className="h-9 px-3 rounded-lg bg-foreground text-surface text-sm">
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading projects…</p>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 text-left text-muted text-xs">
                <th className="font-medium px-4 py-2">Projects</th>
                <th className="font-medium px-4 py-2">Priority</th>
                <th className="font-medium px-4 py-2">Lead</th>
                <th className="font-medium px-4 py-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-4 py-2.5">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="px-4 py-2.5">
                    {p.lead ? (
                      <span className="h-6 w-6 rounded-full bg-accent inline-flex items-center justify-center text-[10px] font-medium text-accent-fg">
                        {p.lead.name?.slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {p.dueDate ? format(new Date(p.dueDate), 'd MMM yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
