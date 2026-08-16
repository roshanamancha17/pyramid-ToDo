import { PRIORITY_LABELS, type TaskPriority, type TaskStatus, STATUS_LABELS } from '@/lib/types';
import { BarChart2 } from 'lucide-react';
import clsx from 'clsx';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  NO_PRIORITY: 'text-muted',
  URGENT: 'text-pink-500',
  HIGH: 'text-red-500',
  MEDIUM: 'text-orange-500',
  LOW: 'text-muted',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'NO_PRIORITY') {
    return <span className="text-xs text-muted">No Priority</span>;
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-medium', PRIORITY_COLOR[priority])}>
      <BarChart2 className="h-3 w-3" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: 'bg-zinc-400',
  DOING: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  ON_HOLD: 'bg-amber-500',
};

export function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={clsx('h-2 w-2 rounded-full', STATUS_DOT[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
