
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, User, BarChart3, Settings, Trash2, Edit, CheckCircle, Circle, Moon, Sun } from 'lucide-react';

const TaskManagerPro = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    status: 'pending'
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManagerTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const initialTasks = [
        { id: 1, title: 'Complete project proposal', description: 'Draft and submit Q4 proposal', priority: 'critical', assignee: 'John Doe', dueDate: '2025-12-01', status: 'pending', createdAt: new Date().toISOString() },
        { id: 2, title: 'Review code changes', description: 'Review PR #234', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-11-30', status: 'pending', createdAt: new Date().toISOString() },
        { id: 3, title: 'Update documentation', description: 'API documentation update', priority: 'medium', assignee: 'Mike Johnson', dueDate: '2025-12-05', status: 'completed', createdAt: new Date().toISOString() },
        { id: 4, title: 'Team meeting prep', description: 'Prepare slides for weekly sync', priority: 'low', assignee: 'Sarah Wilson', dueDate: '2025-12-02', status: 'pending', createdAt: new Date().toISOString() }
      ];
      setTasks(initialTasks);
      localStorage.setItem('taskManagerTasks', JSON.stringify(initialTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const priorityColors = {
    critical: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', light: 'bg-red-50', dark: 'bg-red-900/20' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', light: 'bg-orange-50', dark: 'bg-orange-900/20' },
    medium: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', light: 'bg-blue-50', dark: 'bg-blue-900/20' },
    low: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', light: 'bg-green-50', dark: 'bg-green-900/20' }
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
    const high = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const medium = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length;
    const low = tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length;
    
    return { total, completed, pending, critical, high, medium, low };
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      ...newTask,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      status: 'pending'
    });
    setShowAddTask(false);
  };

  const updateTask = () => {
    if (!editingTask.title.trim()) return;
    
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
        : t
    ));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = getStats();

  const StatCard = ({ label, value, color, icon: Icon }) => (
    <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg bg-opacity-10`}>
          <Icon className={color} size={28} />
        </div>
      </div>
    </div>
  );

  const PriorityChart = () => (
    <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Priority Distribution</h3>
      <div className="space-y-4">
        {[
          { label: 'Critical', value: stats.critical, color: 'bg-red-500', total: stats.pending },
          { label: 'High', value: stats.high, color: 'bg-orange-500', total: stats.pending },
          { label: 'Medium', value: stats.medium, color: 'bg-blue-500', total: stats.pending },
          { label: 'Low', value: stats.low, color: 'bg-green-500', total: stats.pending }
        ].map(item => {
          const percentage = stats.pending > 0 ? (item.value / stats.pending) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                <div 
                  className={`${item.color} h-3 rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TaskCard = ({ task }) => {
    const colors = priorityColors[task.priority];
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    return (
      <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-5 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className="mt-1 transition-all duration-300"
            >
              {task.status === 'completed' ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : (
                <Circle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={24} />
              )}
            </button>
            <div className="flex-1">
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} ${task.status === 'completed' ? 'line-through' : ''}`}>
                {task.title}
              </h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingTask(task)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} text-white`}>
            {task.priority.toUpperCase()}
          </span>
          {task.assignee && (
            <span className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <User size={14} />
              {task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-500 font-semibold' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar size={14} />
              {new Date(task.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </span>
          )}
        </div>
      </div>
    );
  };

  const TaskForm = ({ task, onSave, onCancel, isEdit }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-2xl w-full shadow-2xl transform transition-all duration-300 scale-100`}>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {isEdit ? 'Edit Task' : 'Add New Task'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => onSave({ ...task, title: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              placeholder="e.g., Finish Q4 Report"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              value={task.description}
              onChange={(e) => onSave({ ...task, description: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              rows="3"
              placeholder="Detailed description of the task..."
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
              <select
                value={task.priority}
                onChange={(e) => onSave({ ...task, priority: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => onSave({ ...task, dueDate: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Assignee</label>
            <input
              type="text"
              value={task.assignee}
              onChange={(e) => onSave({ ...task, assignee: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              placeholder="e.g., John Doe"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onCancel}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? updateTask : addTask}
            disabled={!task.title.trim()}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 ${task.title.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400'}`}
          >
            {isEdit ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Tasks" 
          value={stats.total} 
          color={darkMode ? 'text-blue-400' : 'text-blue-600'} 
          icon={BarChart3} 
        />
        <StatCard 
          label="Pending Tasks" 
          value={stats.pending} 
          color={darkMode ? 'text-orange-400' : 'text-orange-600'} 
          icon={Circle} 
        />
        <StatCard 
          label="Completed Tasks" 
          value={stats.completed} 
          color={darkMode ? 'text-green-400' : 'text-green-600'} 
          icon={CheckCircle} 
        />
        <StatCard 
          label="Critical Priority" 
          value={stats.critical} 
          color={darkMode ? 'text-red-400' : 'text-red-600'} 
          icon={Plus} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h3>
            <div className="space-y-4">
              {tasks
                .filter(t => t.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <Calendar size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</span>
                    </div>
                    <span className={`text-sm ${priorityColors[task.priority].text}`}>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No pending tasks. Great job!</p>
              )}
            </div>
          </div>
        </div>
        <PriorityChart />
      </div>
    </div>
  );

  const TaskListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className={`relative w-full md:w-64 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`appearance-none w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-[1.02]"
        >
          <Plus size={20} className="mr-2" />
          Add New Task
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className={`lg:col-span-3 text-center p-10 rounded-xl ${darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
            <p className="text-lg font-medium">No tasks found matching your criteria.</p>
            <p className="mt-2 text-sm">Try adjusting your search term or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-8 shadow-lg max-w-3xl mx-auto space-y-6 border`}>
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} border-b pb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>Application Settings</h2>
      
      <div className="flex justify-between items-center">
        <label className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</label>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {darkMode ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>
      
      <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data Management</h3>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all local task data? This action cannot be undone.')) {
              localStorage.removeItem('taskManagerTasks');
              setTasks([]);
            }
          }}
          className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          <Trash2 size={18} className="mr-2" />
          Clear All Local Data
        </button>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>This will remove all tasks stored in your browser's local storage.</p>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`w-64 flex-shrink-0 ${darkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'} p-6 flex flex-col h-full`}>
      <div className="flex items-center mb-10">
        <BarChart3 size={32} className="text-blue-500 mr-3" />
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>TaskPro</h1>
      </div>
      
      <nav className="flex-grow space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'tasks', label: 'Task List', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center p-3 rounded-xl font-medium transition-colors ${
              activeView === item.id
                ? 'bg-blue-500 text-white shadow-md'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className={`mt-auto pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>© 2025 TaskPro</p>
      </div>
    </div>
  );

  const MainContent = () => {
    let content;
    switch (activeView) {
      case 'dashboard':
        content = <DashboardView />;
        break;
      case 'tasks':
        content = <TaskListView />;
        break;
      case 'settings':
        content = <SettingsView />;
        break;
      default:
        content = <DashboardView />;
    }
    
    return (
      <main className="flex-1 p-8 overflow-y-auto">
        {content}
      </main>
    );
  };

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex transition-colors duration-300`}>
      <Sidebar />
      <MainContent />
      
      {(showAddTask || editingTask) && (
        <TaskForm 
          task={editingTask || newTask}
          onSave={editingTask ? setEditingTask : setNewTask}
          onCancel={() => {
            setShowAddTask(false);
            setEditingTask(null);
            setNewTask({
              title: '',
              description: '',
              priority: 'medium',
              assignee: '',
              dueDate: '',
              status: 'pending'
            });
          }}
          isEdit={!!editingTask}
        />
      )}
    </div>
  );
};

export default TaskManagerPro;
