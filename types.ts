export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  createdDate: string;
  completedDate: string | null;
  priority: Priority;
  status: Status;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  notificationSent: boolean;
}

export interface AppSettings {
  userName: string;
  notificationLeadTime: number; // hours
  defaultView: 'dashboard' | 'all' | 'person' | 'date' | 'categories';
  theme: 'light' | 'dark';
}

export interface FilterState {
  search: string;
  status: Status | 'all';
  priority: Priority | 'all';
  person: string | 'all';
  category: string | 'all';
}
