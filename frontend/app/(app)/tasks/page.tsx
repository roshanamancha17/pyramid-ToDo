'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Plus, PanelLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskListView } from '@/components/TaskListView';
import { FieldsDropdown } from '@/components/FieldsDropdown';
import { AddTaskModal } from '@/components/AddTaskModal';

const FIELD_OPTIONS = [
  { key: 'priority', label: 'Priority' },
  { key: 'members', label: 'Members' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'labels', label: 'Labels' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [visible, setVisible] = useState<Set<string>>(
    new Set(['priority', 'members', 'dueDate']),
  );
  const [addingStatus, setAddingStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    api
      .get<Task[]>('/tasks')
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
  }, [tasks, query]);

  function toggleField(key: string) {
    setVisible((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleMoveTask(taskId: string, newStatus: TaskStatus) {
    const previous = tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update so the drag feels instant, roll back on failure
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch {
      setTasks(previous);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <div className="flex flex-wrap items-center gap-2">
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setSearching(false)}
              placeholder="Search tasks…"
              className="h-9 w-40 sm:w-52 rounded-lg border border-border px-3 text-sm bg-transparent outline-none focus:border-accent"
            />
          ) : (
            <button
              onClick={() => setSearching(true)}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-surface-2"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          <FieldsDropdown options={FIELD_OPTIONS} visible={visible} onToggle={toggleField} />

          <div className="h-9 flex items-center rounded-lg border border-border p-0.5 text-sm">
            <button
              onClick={() => setView('list')}
              className={`px-2.5 h-full rounded-md ${view === 'list' ? 'bg-surface-2 font-medium' : 'text-muted'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('board')}
              className={`px-2.5 h-full rounded-md ${view === 'board' ? 'bg-surface-2 font-medium' : 'text-muted'}`}
            >
              Board
            </button>
          </div>

          <button
            onClick={() => setAddingStatus('TODO')}
            className="h-9 px-3 rounded-lg bg-foreground text-surface text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading tasks…</p>
      ) : view === 'board' ? (
        <TaskBoard
          tasks={filteredTasks}
          visible={visible}
          onAddTask={setAddingStatus}
          onMoveTask={handleMoveTask}
        />
      ) : (
        <TaskListView tasks={filteredTasks} visible={visible} onAddTask={setAddingStatus} />
      )}

      {addingStatus && (
        <AddTaskModal
          status={addingStatus}
          onClose={() => setAddingStatus(null)}
          onCreated={(task) => setTasks((prev) => [task, ...prev])}
        />
      )}
    </div>
  );
}
