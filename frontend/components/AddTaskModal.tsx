'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';

export function AddTaskModal({
  status,
  onClose,
  onCreated,
}: {
  status: TaskStatus;
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const task = await api.post<Task>('/tasks', { title, status });
      onCreated(task);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-30 flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">New Task</h2>
          <button onClick={onClose} className="text-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-transparent outline-none focus:border-accent"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm border border-border hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="h-9 px-4 rounded-lg text-sm bg-foreground text-surface disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
