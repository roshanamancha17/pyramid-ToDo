export type ThemeMode = 'LIGHT' | 'DARK';
export type ColorMode = 'AMBER' | 'BLUE' | 'PINK' | 'ROSE' | 'EMERALD' | 'BLACK';
export type TaskStatus = 'TODO' | 'DOING' | 'COMPLETED' | 'ON_HOLD';
export type TaskPriority = 'NO_PRIORITY' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  title: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  themeMode: ThemeMode;
  colorMode: ColorMode;
}

export interface Label {
  id: string;
  name: string;
  color: string | null;
}

export interface Subtask {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  members: { user: User }[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  createdAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  reporter: User | null;
  members: { user: User }[];
  labels: { label: Label }[];
  subtasks: Subtask[];
  comments?: Comment[];
  activityLogs?: ActivityLogEntry[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  priority: TaskPriority;
  dueDate: string | null;
  lead: User | null;
  owner: User;
  tasks?: Task[];
  _count?: { tasks: number };
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  DOING: 'Doing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  NO_PRIORITY: 'No Priority',
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
