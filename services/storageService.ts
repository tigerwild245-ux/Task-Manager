import { Task, AppSettings } from '../types';

const TASKS_KEY = 'fincantieri_tasks';
const SETTINGS_KEY = 'fincantieri_settings';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Office Manager',
  notificationLeadTime: 24,
  defaultView: 'dashboard',
  theme: 'light',
};

// Seed data for first run
const MOCK_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Q4 Financial Report Compilation',
    description: 'Gather data from all departments and compile the Q4 preliminary report.',
    assignedTo: 'Marco Rossi',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    createdDate: new Date().toISOString(),
    completedDate: null,
    priority: 'high',
    status: 'in-progress',
    category: 'Finance',
    tags: ['quarterly', 'urgent'],
    subtasks: [
      { id: 'st-1', title: 'Collect IT budget data', completed: true, assignedTo: 'Marco Rossi' },
      { id: 'st-2', title: 'Review HR operational costs', completed: false, assignedTo: 'Julia Bianchi' }
    ],
    comments: [],
    notificationSent: false,
  },
  {
    id: 't-2',
    title: 'Safety Equipment Audit',
    description: 'Annual check of all shipyard safety equipment and certifications.',
    assignedTo: 'Giuseppe Verdi',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Overdue)
    createdDate: new Date().toISOString(),
    completedDate: null,
    priority: 'critical',
    status: 'overdue',
    category: 'Operations',
    tags: ['safety', 'audit'],
    subtasks: [],
    comments: [
      { id: 'c-1', text: 'We are missing the manifest for Dock 4.', author: 'Giuseppe Verdi', timestamp: new Date().toISOString() }
    ],
    notificationSent: true,
  }
];

export const getTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : MOCK_TASKS;
  } catch (error) {
    console.error('Error reading tasks', error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks', error);
  }
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
