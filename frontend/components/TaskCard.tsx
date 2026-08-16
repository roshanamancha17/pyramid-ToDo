'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Tag } from 'lucide-react';
import Link from 'next/link';
import { PriorityBadge } from './Badges';
import type { Task } from '@/lib/types';

export function TaskCard({ task, visible }: { task: Task; visible: Set<string> }) {
  const [dragging, setDragging] = useState(false);

  return (
    <Link
      href={`/tasks/${task.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={`block bg-surface border border-border rounded-xl p-3 hover:shadow-sm transition group cursor-grab active:cursor-grabbing ${
        dragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <button
          onClick={(e) => e.preventDefault()}
          className="opacity-0 group-hover:opacity-100 text-muted shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {visible.has('members') && task.members[0] && (
            <span className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-medium text-accent-fg">
              {(task.members[0].user.name ?? '?').slice(0, 2).toUpperCase()}
            </span>
          )}
          {visible.has('priority') && <PriorityBadge priority={task.priority} />}
        </div>
        {visible.has('dueDate') && task.dueDate && (
          <span className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
            {format(new Date(task.dueDate), 'd MMM')}
          </span>
        )}
      </div>

      {visible.has('labels') && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.slice(0, 2).map(({ label }) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-surface-2 text-muted"
            >
              <Tag className="h-2.5 w-2.5" />
              {label.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
