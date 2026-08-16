'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Send, Plus, Calendar as CalendarIcon, Tag as TagIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Task, TaskPriority, User, Label } from '@/lib/types';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/types';
import { PriorityBadge } from '@/components/Badges';

const PRIORITY_ORDER: TaskPriority[] = ['NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];

type OpenPanel = 'priority' | 'members' | 'labels' | 'dueDate' | null;

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [comment, setComment] = useState('');
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);

  useEffect(() => {
    api.get<Task>(`/tasks/${params.id}`).then(setTask);
    api.get<User[]>('/users').then(setAllUsers);
    api.get<Label[]>('/labels').then(setAllLabels);
  }, [params.id]);

  async function patchTask(body: Record<string, unknown>) {
    if (!task) return;
    const updated = await api.patch<Task>(`/tasks/${task.id}`, body);
    setTask(updated);
  }

  async function updatePriority(priority: TaskPriority) {
    await patchTask({ priority });
    setOpenPanel(null);
  }

  async function toggleMember(userId: string) {
    if (!task) return;
    const current = task.members.map((m) => m.user.id);
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    await patchTask({ memberIds: next });
  }

  async function toggleLabel(labelId: string) {
    if (!task) return;
    const current = task.labels.map((l) => l.label.id);
    const next = current.includes(labelId)
      ? current.filter((id) => id !== labelId)
      : [...current, labelId];
    await patchTask({ labelIds: next });
  }

  async function updateDueDate(dateStr: string) {
    await patchTask({ dueDate: dateStr ? new Date(dateStr).toISOString() : null });
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !comment.trim()) return;
    await api.post(`/tasks/${task.id}/comments`, { content: comment });
    setComment('');
    const refreshed = await api.get<Task>(`/tasks/${task.id}`);
    setTask(refreshed);
  }

  if (!task) return <p className="p-6 text-muted text-sm">Loading…</p>;

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1 min-w-0 p-4 md:p-6 lg:max-w-3xl">
        <button
          onClick={() => router.push('/tasks')}
          className="flex items-center gap-1 text-sm text-muted mb-4 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-2xl font-semibold mb-1">{task.title}</h1>
        {task.description && <p className="text-muted text-sm mb-4">{task.description}</p>}

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {task.labels.map(({ label }) => (
              <span key={label.id} className="text-xs px-2 py-0.5 rounded bg-surface-2 text-muted">
                {label.name}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-sm font-medium mb-2">Subtasks</h2>
        <div className="border border-border rounded-xl overflow-x-auto mb-6">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-surface-2 text-left text-muted text-xs">
                <th className="font-medium px-3 py-2">Task</th>
                <th className="font-medium px-3 py-2">Priority</th>
                <th className="font-medium px-3 py-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {task.subtasks.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2">{s.title}</td>
                  <td className="px-3 py-2">
                    <PriorityBadge priority={s.priority} />
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {s.dueDate ? format(new Date(s.dueDate), 'd MMM yyyy') : '—'}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td colSpan={3} className="px-3 py-2 text-muted text-sm flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Subtasks
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-sm font-medium mb-2">Comments</h2>
        <div className="space-y-3 mb-4">
          {task.comments?.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-accent shrink-0" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">{c.author.name}</span>{' '}
                  <span className="text-muted text-xs">{format(new Date(c.createdAt), 'd MMM, HH:mm')}</span>
                </p>
                <p className="text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submitComment} className="flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 h-10 rounded-lg border border-border px-3 text-sm bg-transparent outline-none focus:border-accent"
          />
          <button type="submit" className="h-10 w-10 rounded-lg border border-border flex items-center justify-center">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <aside className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border p-5">
        <h3 className="text-sm font-medium mb-3">Details</h3>
        <div className="space-y-3 text-sm">
          <Row label="Status" value={STATUS_LABELS[task.status]} />

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === 'priority' ? null : 'priority')}
              className="w-full flex items-center justify-between"
            >
              <span className="text-muted">Priority</span>
              <PriorityBadge priority={task.priority} />
            </button>
            {openPanel === 'priority' && (
              <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg py-1 z-10">
                {PRIORITY_ORDER.map((p) => (
                  <button
                    key={p}
                    onClick={() => updatePriority(p)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 flex items-center justify-between"
                  >
                    {PRIORITY_LABELS[p]}
                    {task.priority === p && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === 'members' ? null : 'members')}
              className="w-full flex items-center justify-between"
            >
              <span className="text-muted">Members</span>
              <span className="flex items-center gap-1">
                {task.members.length === 0 && <span className="text-muted">Add members</span>}
                {task.members.slice(0, 3).map((m) => (
                  <span
                    key={m.user.id}
                    title={m.user.name ?? ''}
                    className="h-6 w-6 -ml-1.5 first:ml-0 rounded-full bg-accent border-2 border-surface flex items-center justify-center text-[10px] font-medium text-accent-fg"
                  >
                    {(m.user.name ?? '?').slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </span>
            </button>
            {openPanel === 'members' && (
              <div className="absolute right-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg py-1 z-10 max-h-64 overflow-y-auto">
                {allUsers.map((u) => {
                  const checked = task.members.some((m) => m.user.id === u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleMember(u.id)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 flex items-center gap-2"
                    >
                      <span className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-[9px] font-medium text-accent-fg shrink-0">
                        {(u.name ?? '?').slice(0, 2).toUpperCase()}
                      </span>
                      <span className="truncate flex-1">{u.name ?? u.email}</span>
                      {checked && <span>✓</span>}
                    </button>
                  );
                })}
                {allUsers.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted">No other users yet</p>
                )}
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === 'dueDate' ? null : 'dueDate')}
              className="w-full flex items-center justify-between"
            >
              <span className="text-muted">Dates</span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-muted" />
                {task.dueDate ? format(new Date(task.dueDate), 'd MMM yyyy') : 'Set date'}
              </span>
            </button>
            {openPanel === 'dueDate' && (
              <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg p-3 z-10">
                <input
                  type="date"
                  defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                  onChange={(e) => {
                    updateDueDate(e.target.value);
                    setOpenPanel(null);
                  }}
                  className="text-sm bg-transparent outline-none border border-border rounded-md px-2 py-1"
                />
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="relative">
            <button
              onClick={() => setOpenPanel(openPanel === 'labels' ? null : 'labels')}
              className="w-full flex items-center justify-between"
            >
              <span className="text-muted">Labels</span>
              <span className="flex items-center gap-1.5 text-muted">
                <TagIcon className="h-3.5 w-3.5" />
                {task.labels.length > 0 ? `${task.labels.length} selected` : 'Add labels'}
              </span>
            </button>
            {openPanel === 'labels' && (
              <div className="absolute right-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg py-1 z-10 max-h-64 overflow-y-auto">
                {allLabels.map((l) => {
                  const checked = task.labels.some((tl) => tl.label.id === l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLabel(l.id)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 flex items-center justify-between"
                    >
                      {l.name}
                      {checked && <span>✓</span>}
                    </button>
                  );
                })}
                {allLabels.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted">No labels yet</p>
                )}
              </div>
            )}
          </div>

          <Row label="Reporter" value={task.reporter?.name ?? '—'} />
        </div>

        {task.activityLogs && task.activityLogs.length > 0 && (
          <>
            <h3 className="text-sm font-medium mt-6 mb-3">Updates</h3>
            <div className="space-y-2">
              {task.activityLogs.map((a) => (
                <p key={a.id} className="text-xs text-muted">
                  <span className="text-foreground font-medium">{a.user.name}</span> {a.action}
                </p>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
