import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  HashRouter, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  CalendarDays, 
  Settings as SettingsIcon,
  Presentation,
  Plus,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Task, AppSettings, Priority, Status, Subtask } from './types';
import * as Storage from './services/storageService';
import { generatePresentationHTML } from './services/htmlGenerator.ts';

// --- Constants & Utilities ---

const COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#1e293b'
};

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'critical': return 'border-l-4 border-l-red-500';
    case 'high': return 'border-l-4 border-l-orange-500';
    case 'medium': return 'border-l-4 border-l-cyan-500';
    default: return 'border-l-4 border-l-gray-300';
  }
};

// --- Components ---

// 1. Sidebar
const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const location = useLocation();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ListTodo, label: 'All Tasks', path: '/tasks' },
    { icon: Users, label: 'By Person', path: '/person' },
    { icon: CalendarDays, label: 'By Date', path: '/calendar' },
    { icon: Presentation, label: 'Generate Report', path: '/report' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={toggle}
        />
      )}
      
      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 glass shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              F
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Fincantieri
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">Task Manager Pro</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggle()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-blue-600'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

// 2. Header
const Header = ({ 
  toggleSidebar, 
  searchTerm, 
  setSearchTerm,
  userName,
  notificationCount
}: { 
  toggleSidebar: () => void; 
  searchTerm: string; 
  setSearchTerm: (s: string) => void;
  userName: string;
  notificationCount: number;
}) => {
  return (
    <header className="sticky top-0 z-10 glass border-b border-white/20 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/50 text-slate-600"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-white/30 focus-within:ring-2 ring-blue-500/50 transition-all w-64">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/50 transition-colors text-slate-600">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
          )}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-500">Office Manager</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// 3. Task Modal (Create/Edit)
const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTask, 
  users 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (t: Task) => void; 
  initialTask: Task | null;
  users: string[];
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    category: 'General',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: []
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        ...initialTask,
        dueDate: initialTask.dueDate.split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'General',
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: [],
        tags: [],
        comments: []
      });
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    const taskToSave: Task = {
      id: initialTask?.id || crypto.randomUUID(),
      title: formData.title!,
      description: formData.description || '',
      assignedTo: formData.assignedTo || 'Unassigned',
      dueDate: new Date(formData.dueDate!).toISOString(),
      createdDate: initialTask?.createdDate || new Date().toISOString(),
      completedDate: formData.status === 'completed' ? new Date().toISOString() : null,
      priority: formData.priority as Priority,
      status: formData.status as Status,
      category: formData.category || 'General',
      tags: formData.tags || [],
      subtasks: formData.subtasks || [],
      comments: formData.comments || [],
      notificationSent: initialTask?.notificationSent || false
    };
    onSave(taskToSave);
    onClose();
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: 'New Subtask',
      completed: false
    };
    setFormData({ ...formData, subtasks: [...(formData.subtasks || []), newSubtask] });
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    const updated = (formData.subtasks || []).map(st => st.id === id ? { ...st, ...updates } : st);
    setFormData({ ...formData, subtasks: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        
        <form id="taskForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input 
                type="text" 
                list="users-list"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.assignedTo}
                onChange={e => setFormData({...formData, assignedTo: e.target.value})}
              />
              <datalist id="users-list">
                {users.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Subtasks</label>
              <button type="button" onClick={addSubtask} className="text-sm text-blue-600 hover:underline">+ Add Subtask</button>
            </div>
            <div className="space-y-2">
              {(formData.subtasks || []).map((st) => (
                <div key={st.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={st.completed}
                    onChange={e => updateSubtask(st.id, { completed: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <input 
                    type="text" 
                    value={st.title}
                    onChange={e => updateSubtask(st.id, { title: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                  />
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, subtasks: formData.subtasks?.filter(s => s.id !== st.id)})}
                    className="text-red-500 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </form>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button form="taskForm" type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Save Task</button>
        </div>
      </div>
    </div>
  );
};

// --- Views ---

const DashboardView = ({ tasks }: { tasks: Task[] }) => {
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      today: tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length
    };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    tasks.forEach(t => { if(t.status !== 'completed') counts[t.priority]++ });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const statusData = useMemo(() => {
    const counts = { pending: 0, 'in-progress': 0, completed: 0, overdue: 0 };
    tasks.forEach(t => counts[t.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', val: stats.total, color: 'text-blue-600', icon: ListTodo },
          { label: 'Completed', val: stats.completed, color: 'text-green-600', icon: CheckCircle2 },
          { label: 'Overdue', val: stats.overdue, color: 'text-red-600', icon: AlertTriangle },
          { label: 'Due Today', val: stats.today, color: 'text-orange-600', icon: Clock },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">{item.label}</p>
              <h3 className={`text-3xl font-bold mt-1 ${item.color}`}>{item.val}</h3>
            </div>
            <div className={`p-3 rounded-full bg-opacity-10 ${item.color.replace('text', 'bg')}`}>
              <item.icon className={item.color} size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TaskListView = ({ 
  tasks, 
  searchTerm, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: { 
  tasks: Task[]; 
  searchTerm: string; 
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, s: Status) => void;
}) => {
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No tasks found</div>
      ) : (
        filteredTasks.map(task => (
          <div 
            key={task.id} 
            className={`glass-card p-5 rounded-xl transition-all hover:scale-[1.01] hover:shadow-lg ${getPriorityColor(task.priority)}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2">{task.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Users size={14}/> {task.assignedTo}</span>
                  <span className="flex items-center gap-1"><CalendarDays size={14}/> {formatDate(task.dueDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="bg-white/50 border border-slate-200 rounded-lg text-sm p-2 outline-none"
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
                <button 
                  onClick={() => onEdit(task)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Edit
                </button>
                <button 
                  onClick={() => { if(confirm('Delete this task?')) onDelete(task.id) }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Simple progress bar if subtasks exist */}
            {task.subtasks.length > 0 && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const PersonView = ({ tasks }: { tasks: Task[] }) => {
  const people = Array.from(new Set(tasks.map(t => t.assignedTo))).sort();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map(person => {
        const personTasks = tasks.filter(t => t.assignedTo === person);
        const completed = personTasks.filter(t => t.status === 'completed').length;
        
        return (
          <div key={person} className="glass-card rounded-2xl overflow-hidden group">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                  {person.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{person}</h3>
                  <p className="text-xs text-slate-500">{personTasks.length} Tasks assigned</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{Math.round((completed/personTasks.length)*100)}%</span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {personTasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(t => (
                <div key={t.id} className="p-3 bg-white/50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-slate-700 truncate w-3/4">{t.title}</span>
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${t.status === 'completed' ? 'bg-green-500' : t.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatDate(t.dueDate)}</span>
                    <span className="capitalize">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CalendarView = ({ tasks }: { tasks: Task[] }) => {
  const sortedTasks = [...tasks].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  // Group by date string
  const grouped = sortedTasks.reduce((acc, task) => {
    const date = new Date(task.dueDate).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([date, groupTasks]) => (
        <div key={date} className="relative pl-8 border-l-2 border-slate-200">
          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
          <h3 className="text-xl font-bold text-slate-800 mb-4">{date}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupTasks.map(t => (
               <div key={t.id} className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
                 <div className="font-bold text-slate-800 mb-1">{t.title}</div>
                 <div className="text-sm text-slate-500 flex justify-between">
                   <span>{t.assignedTo}</span>
                   <span className={`px-2 rounded-full text-xs ${getStatusColor(t.status)}`}>{t.status}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportGenerator = ({ tasks, settings }: { tasks: Task[], settings: AppSettings }) => {
  const [title, setTitle] = useState('Task Status Report');
  const [subtitle, setSubtitle] = useState('Weekly Operational Overview');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const html = generatePresentationHTML(tasks, settings, { title, subtitle, includeCharts: true });
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fincantieri-Report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 1000); // Simulate processing
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Presentation size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Generate HTML Presentation</h2>
        <p className="text-slate-500">Create a standalone, interactive report file.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Report Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
          <input 
            type="text" 
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>Download Presentation HTML</>
          )}
        </button>
      </div>
    </div>
  );
};

const SettingsView = ({ settings, onSave, onReset }: { settings: AppSettings, onSave: (s: AppSettings) => void, onReset: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl space-y-8">
       <h2 className="text-2xl font-bold text-slate-800">Application Settings</h2>
       
       <div>
         <label className="block text-sm font-medium text-slate-700 mb-2">User Name</label>
         <input 
           type="text" 
           value={localSettings.userName}
           onChange={e => setLocalSettings({...localSettings, userName: e.target.value})}
           className="w-full px-4 py-2 border border-slate-200 rounded-lg"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-slate-700 mb-2">Notification Lead Time (Hours)</label>
         <input 
           type="number" 
           value={localSettings.notificationLeadTime}
           onChange={e => setLocalSettings({...localSettings, notificationLeadTime: parseInt(e.target.value)})}
           className="w-full px-4 py-2 border border-slate-200 rounded-lg"
         />
       </div>

       <div className="flex gap-4 pt-4 border-t border-slate-100">
         <button 
           onClick={() => onSave(localSettings)}
           className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
         >
           Save Changes
         </button>
         <button 
           onClick={() => { if(confirm('This will clear all tasks. Are you sure?')) onReset(); }}
           className="px-6 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
         >
           Reset All Data
         </button>
       </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(Storage.getSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadedTasks = Storage.getTasks();
    setTasks(loadedTasks);
    
    // Check notifications periodically
    const checkNotifications = () => {
      // Logic would go here to send browser notifications
    };
    const interval = setInterval(checkNotifications, 1800000); // 30 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    Storage.saveSettings(settings);
  }, [settings]);

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, status: Status) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, 
      status, 
      completedDate: status === 'completed' ? new Date().toISOString() : null 
    } : t));
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Derived state
  const uniqueUsers = Array.from(new Set(tasks.map(t => t.assignedTo))).filter((u): u is string => !!u);
  const notificationCount = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < new Date(Date.now() + 86400000))).length;

  return (
    <HashRouter>
      <div className="flex min-h-screen text-slate-800 font-sans">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all">
          <Header 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userName={settings.userName}
            notificationCount={notificationCount}
          />

          <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
            <Routes>
              <Route path="/" element={
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <button onClick={openNewTaskModal} className="btn-primary flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                      <Plus size={20} /> New Task
                    </button>
                  </div>
                  <DashboardView tasks={tasks} />
                </>
              } />
              <Route path="/tasks" element={
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">All Tasks</h2>
                    <button onClick={openNewTaskModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30">
                      <Plus size={20} /> New Task
                    </button>
                  </div>
                  <TaskListView 
                    tasks={tasks} 
                    searchTerm={searchTerm} 
                    onEdit={openEditTaskModal}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </>
              } />
              <Route path="/person" element={
                 <>
                 <h2 className="text-2xl font-bold mb-8">Tasks By Person</h2>
                 <PersonView tasks={tasks} />
               </>
              } />
              <Route path="/calendar" element={
                 <>
                 <h2 className="text-2xl font-bold mb-8">Timeline View</h2>
                 <CalendarView tasks={tasks} />
               </>
              } />
              <Route path="/report" element={<ReportGenerator tasks={tasks} settings={settings} />} />
              <Route path="/settings" element={
                <SettingsView 
                  settings={settings} 
                  onSave={setSettings} 
                  onReset={() => {
                    localStorage.clear();
                    window.location.reload();
                  }} 
                />
              } />
            </Routes>
          </div>
        </main>

        <TaskModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          initialTask={editingTask}
          users={uniqueUsers}
        />
      </div>
    </HashRouter>
  );
};

export default App;