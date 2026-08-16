'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Project, TaskStatus } from '@/lib/types';
import { TaskListView } from '@/components/TaskListView';
import { AddTaskModal } from '@/components/AddTaskModal';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [addingStatus, setAddingStatus] = useState<TaskStatus | null>(null);
  const visible = new Set(['priority', 'members', 'dueDate']);

  useEffect(() => {
    api.get<Project>(`/projects/${params.id}`).then(setProject);
  }, [params.id]);

  if (!project) return <p className="p-6 text-muted text-sm">Loading…</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-1.5 text-sm text-muted mb-4">
        <Link href="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground">{project.name}</span>
      </div>

      <h1 className="text-xl font-semibold mb-5">Tasks</h1>

      <TaskListView
        tasks={project.tasks ?? []}
        visible={visible}
        onAddTask={setAddingStatus}
      />

      {addingStatus && (
        <AddTaskModal
          status={addingStatus}
          onClose={() => setAddingStatus(null)}
          onCreated={(task) =>
            setProject((prev) => (prev ? { ...prev, tasks: [task, ...(prev.tasks ?? [])] } : prev))
          }
        />
      )}
    </div>
  );
}
