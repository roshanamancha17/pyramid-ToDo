'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { PriorityBadge } from './Badges';
import { STATUS_LABELS, type Task, type TaskStatus } from '@/lib/types';

const GROUPS: TaskStatus[] = ['TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];

export function TaskListView({
  tasks,
  visible,
  onAddTask,
}: {
  tasks: Task[];
  visible: Set<string>;
  onAddTask: (status: TaskStatus) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set());

  function toggle(status: TaskStatus) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {GROUPS.map((status) => {
        const groupTasks = tasks.filter((t) => t.status === status);
        const isCollapsed = collapsed.has(status);
        return (
          <div key={status}>
            <button
              onClick={() => toggle(status)}
              className="flex items-center gap-1.5 text-sm font-medium mb-2"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {STATUS_LABELS[status]}
              <span className="text-muted font-normal">{groupTasks.length}</span>
            </button>

            {!isCollapsed && (
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-surface-2 text-left text-muted text-xs">
                      <th className="font-medium px-4 py-2">Task</th>
                      {visible.has('priority') && <th className="font-medium px-4 py-2">Priority</th>}
                      {visible.has('members') && <th className="font-medium px-4 py-2">Members</th>}
                      {visible.has('dueDate') && <th className="font-medium px-4 py-2">Due Date</th>}
                      <th className="font-medium px-4 py-2 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupTasks.map((task) => (
                      <tr key={task.id} className="border-t border-border hover:bg-surface-2/60">
                        <td className="px-4 py-2.5">
                          <Link href={`/tasks/${task.id}`} className="hover:underline">
                            {task.title}
                          </Link>
                        </td>
                        {visible.has('priority') && (
                          <td className="px-4 py-2.5">
                            <PriorityBadge priority={task.priority} />
                          </td>
                        )}
                        {visible.has('members') && (
                          <td className="px-4 py-2.5">
                            {task.members[0] ? (
                              <span className="h-6 w-6 rounded-full bg-accent inline-flex items-center justify-center text-[10px] font-medium text-accent-fg">
                                {(task.members[0].user.name ?? '?').slice(0, 2).toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        )}
                        {visible.has('dueDate') && (
                          <td className="px-4 py-2.5 text-muted">
                            {task.dueDate ? format(new Date(task.dueDate), 'd MMM yyyy') : '—'}
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border">
                      <td colSpan={5} className="px-4 py-2">
                        <button
                          onClick={() => onAddTask(status)}
                          className="text-muted hover:text-foreground text-sm flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Task
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
