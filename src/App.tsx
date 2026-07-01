import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, ListTodo, Sparkles, RefreshCw, Layers, ClipboardList, LogOut } from 'lucide-react';
import { Task, User } from './types';
import StatsSummary from './components/StatsSummary';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';

const LOCAL_STORAGE_KEY = 'task_manager_items_v2';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Structure CRUD task schema definitions',
    description: 'Establish absolute structural integrity across task items using modern TypeScript models.',
    priority: 'high',
    category: 'Work',
    dueDate: new Date().toISOString().split('T')[0], // Due today
    completed: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Integrate browser local storage listeners',
    description: 'Construct real-time state synchronizers to protect task definitions against reload actions.',
    priority: 'medium',
    category: 'Finance',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Due tomorrow
    completed: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Evaluate responsive viewport layouts',
    description: 'Verify padding structures, button touch-targets, and modal drawer alignments on small screen targets.',
    priority: 'low',
    category: 'Personal',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Due in 2 days
    completed: false,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage tasks:', e);
    }
    return INITIAL_TASKS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('task_manager_current_session');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error reading session:', e);
    }
    return null;
  });

  // Sync tasks state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Sync user state to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('task_manager_current_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('task_manager_current_session');
    }
  }, [currentUser]);

  // Operations handlers
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTrigger = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      // UPDATE action
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
      setEditingTask(null);
    } else {
      // CREATE action
      const newId = `task-${Math.random().toString(36).substring(2, 11)}`;
      const newTask: Task = {
        ...taskData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleResetToSamples = () => {
    if (window.confirm('Do you want to restore the initial sample tasks? This will reset your current board.')) {
      setTasks(INITIAL_TASKS);
    }
  };

  // Determine current display info
  const pendingCount = tasks.filter((t) => !t.completed).length;
  
  // Format current date display nicely e.g. "Sunday, May 31"
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (!currentUser) {
    return <Auth onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#070c09] text-neutral-200 antialiased font-sans pb-16 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] bg-[#10b981]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-[#0d5335]/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid line patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-10">
        {/* Personalized Branding Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b120f] p-6 rounded-3xl border border-emerald-500/10 shadow-lg animate-fade-in">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 bg-emerald-500 text-neutral-950 rounded-xl shadow-md shadow-emerald-500/10">
                <ClipboardList className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <h1 id="app-title" className="text-2xl font-bold tracking-tight text-emerald-400">Task Board</h1>
              <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3 h-3" />
                Live Engine
              </div>
            </div>
            <p className="text-sm font-semibold text-emerald-500/70">
              Welcome back, <strong className="text-emerald-300">{currentUser.name}</strong>. You have <span className="text-emerald-300 font-bold underline decoration-emerald-500 decoration-2">{pendingCount} active items</span> in your queue.
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-left sm:text-right gap-2.5">
            <div>
              <span id="header-date" className="text-sm font-bold text-emerald-100 font-mono block">{formattedToday}</span>
              <span className="text-xs text-neutral-400 font-medium block mt-0.5">
                Session: <span className="text-emerald-300 underline">{currentUser.email}</span>
              </span>
            </div>
            
            <button
              id="logout-btn"
              onClick={() => setCurrentUser(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/10 hover:border-rose-500/25 text-rose-350 bg-rose-950/20 hover:bg-rose-950/35 text-xs font-semibold cursor-pointer transition-colors"
              title="Exit active log-in session"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <StatsSummary tasks={tasks} />

        {/* Controller and Tasks Board column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-500/80 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-500/70" />
              <h2>Task Streams</h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Reset to Samples button */}
              <button
                id="reset-samples-btn"
                onClick={handleResetToSamples}
                className="text-xs font-bold text-neutral-400 hover:text-emerald-300 flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-emerald-950/30 transition-all cursor-pointer border border-transparent hover:border-emerald-500/5 animate-transition"
                title="Restore default samples"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-450" />
                Restore Samples
              </button>

              {/* Action Primary button to expand Create modal form */}
              <button
                id="main-create-task-btn"
                onClick={() => {
                  setEditingTask(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-500 border border-emerald-500 text-neutral-950 hover:bg-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer animate-transition"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          {/* Interactive filterable and sortable Task List */}
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTrigger}
            onDelete={handleDelete}
            onOpenCreateModal={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          />
        </div>
      </main>

      {/* Slide-over or Modal edit/create element */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        editingTask={editingTask}
      />
    </div>
  );
}

