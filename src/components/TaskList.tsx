import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ArrowUpDown, X, FolderKanban, CheckSquare, Plus, RefreshCw } from 'lucide-react';
import { Task, SortField, SortOrder } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

export default function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenCreateModal,
}: TaskListProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Multi-column filter showing toggles
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Derive unique categories present in existing tasks
  const allPostCategories = useMemo(() => {
    const list = tasks.map((t) => t.category).filter(Boolean);
    return Array.from(new Set(list));
  }, [tasks]);

  // Reset filters action
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  // Process filters and sorting
  const processedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query match
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Status match
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && !task.completed) ||
          (statusFilter === 'completed' && task.completed);

        // Priority match
        const matchesPriority =
          priorityFilter === 'all' || task.priority === priorityFilter;

        // Category match
        const matchesCategory =
          categoryFilter === 'all' || task.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
      })
      .sort((a, b) => {
        // Dynamic comparator
        let factor = sortOrder === 'asc' ? 1 : -1;
        
        if (sortField === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate) * factor;
        }

        if (sortField === 'createdAt') {
          return a.createdAt.localeCompare(b.createdAt) * factor;
        }

        if (sortField === 'priority') {
          const valA = PRIORITY_ORDER[a.priority] || 0;
          const valB = PRIORITY_ORDER[b.priority] || 0;
          return (valA - valB) * factor;
        }

        if (sortField === 'title') {
          return a.title.localeCompare(b.title) * factor;
        }

        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortField, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="space-y-6">
      {/* Search & Controller Header */}
      <div className="bg-[#0b120f] p-4 rounded-3xl border border-emerald-500/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="search-input"
              type="text"
              placeholder="Search tasks by name or text outline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-emerald-500/10 text-sm font-medium bg-emerald-950/15 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/5 transition-all animate-transition"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-500 hover:text-emerald-400 hover:bg-emerald-950/20 transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle advanced filters button */}
            <button
              id="toggle-adv-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showAdvancedFilters || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#0e1713] border-emerald-500/10 text-neutral-300 hover:bg-emerald-950/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(priorityFilter !== 'all' || categoryFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              )}
            </button>

            {/* Quick Create Task floating/inline helper */}
            <button
              id="quick-add-task-btn"
              onClick={onOpenCreateModal}
              className="px-4 py-3 bg-emerald-500 border border-emerald-500 text-neutral-950 hover:bg-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hidden sm:flex"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Tab Status Bar Filters (All / Active / Completed) */}
        <div className="flex justify-between items-center gap-4 flex-wrap border-t border-emerald-500/5 pt-4">
          <div role="tablist" className="flex items-center gap-1.5 p-1 bg-emerald-950/20 rounded-2xl border border-emerald-500/5">
            {(['all', 'active', 'completed'] as const).map((status) => {
              const isSelected = statusFilter === status;
              return (
                <button
                  id={`tab-status-${status}`}
                  key={status}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-emerald-200 hover:bg-emerald-950/20'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Quick Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-wide">Sort by:</span>
            <select
              id="sort-field-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-2 rounded-xl border border-emerald-500/10 text-xs font-bold text-neutral-300 bg-[#0c1310] hover:bg-emerald-950/20 focus:outline-[#10b981]/20 cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date added</option>
              <option value="title">Alphabetical</option>
            </select>

            <button
              id="toggle-sort-order-btn"
              onClick={toggleSortOrder}
              className="p-2 border border-emerald-500/10 rounded-xl bg-[#0c1310] hover:bg-[#0f1b16] text-neutral-300 hover:text-emerald-405 transition-colors cursor-pointer"
              title={sortOrder === 'asc' ? 'Descending order' : 'Ascending order'}
            >
              <ArrowUpDown className={`w-3.5 h-3.5 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              id="advanced-filters-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-emerald-500/5 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Selection filter */}
                <div className="space-y-1.5">
                  <label htmlFor="filter-priority-select" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Select Urgent Priority
                  </label>
                  <select
                    id="filter-priority-select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/10 bg-[#0c120f] font-semibold text-sm text-neutral-300 cursor-pointer focus:outline-none focus:border-emerald-500/30"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Only</option>
                    <option value="medium">Medium Only</option>
                    <option value="low">Low Only</option>
                  </select>
                </div>

                {/* Categories filtering selection */}
                <div className="space-y-1.5">
                  <label htmlFor="filter-category-select" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Choose Category Folder
                  </label>
                  <select
                    id="filter-category-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/10 bg-[#0c120f] font-semibold text-sm text-neutral-300 cursor-pointer focus:outline-none focus:border-emerald-500/30"
                  >
                    <option value="all">All Category Domains</option>
                    {/* Hardcoded presets first if not empty list */}
                    {['Work', 'Personal', 'Shopping', 'Health', 'Finance'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {/* Add existing customized ones if any unique names are found */}
                    {allPostCategories
                      .filter((c) => !['Work', 'Personal', 'Shopping', 'Health', 'Finance'].includes(c))
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} (Custom)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Reset active filters option if something active */}
              {(priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== '') && (
                <div className="flex justify-end pt-3 text-xs font-bold text-emerald-500/80 hover:text-emerald-400 transition-colors">
                  <button
                    id="reset-filters-btn"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 cursor-pointer hover:underline"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-400" />
                    Reset active filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Tasks Stream Grid */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {processedTasks.length > 0 ? (
            processedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <motion.div
              id="no-tasks-fallback"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b120f]/60 border-2 border-dashed border-emerald-500/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 bg-[#090f0c] text-emerald-400 rounded-full border border-emerald-500/10 shadow-sm">
                <FolderKanban className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-lg font-bold text-emerald-100 tracking-tight">No tasks correspond</h4>
                <p className="text-sm text-neutral-400 font-medium">
                  We found zero active items inside your search and filtering criteria. Create another task or wipe the filters.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {(priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== '' || statusFilter !== 'all') ? (
                  <button
                    id="clear-all-filters-fallback-btn"
                    onClick={handleResetFilters}
                    className="px-5 py-2 rounded-xl border border-emerald-500/10 bg-emerald-950/20 hover:bg-emerald-950/40 text-xs font-semibold text-neutral-300 transition-colors shadow-xs cursor-pointer"
                  >
                    Clear Filter Scope
                  </button>
                ) : null}
                <button
                  id="create-task-fallback-btn"
                  onClick={onOpenCreateModal}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-neutral-950 transition-colors shadow-sm cursor-pointer"
                >
                  Create New Task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
