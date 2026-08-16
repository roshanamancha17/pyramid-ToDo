'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { STATUS_LABELS, type Task, type TaskStatus } from '@/lib/types';
import clsx from 'clsx';

const COLUMNS: TaskStatus[] = ['TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];

export function TaskBoard({
  tasks,
  visible,
  onAddTask,
  onMoveTask,
}: {
  tasks: Task[];
  visible: Set<string>;
  onAddTask: (status: TaskStatus) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onMoveTask(taskId, status);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        const isDragOver = dragOverColumn === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverColumn !== status) setDragOverColumn(status);
            }}
            onDragLeave={(e) => {
              // Only clear if we're actually leaving the column, not entering a child
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverColumn(null);
              }
            }}
            onDrop={(e) => handleDrop(e, status)}
            className={clsx(
              'w-72 shrink-0 rounded-xl transition-colors',
              isDragOver && 'bg-accent/5 ring-2 ring-accent/40',
            )}
          >
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-muted">⠿</span>
                <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
                <span className="text-xs text-muted">{columnTasks.length}</span>
              </div>
              <div className="flex items-center gap-1 text-muted">
                <button onClick={() => onAddTask(status)}>
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-2 min-h-[40px]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} visible={visible} />
              ))}
              <button
                onClick={() => onAddTask(status)}
                className="w-full text-left text-sm text-muted hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-surface transition flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
