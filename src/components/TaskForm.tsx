import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, AlertTriangle, Plus } from 'lucide-react';
import { Task } from '../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  editingTask: Task | null;
}

const PRESET_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];

export default function TaskForm({ isOpen, onClose, onSubmit, editingTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  // Synchronize state with editing task (if defined)
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      
      if (PRESET_CATEGORIES.includes(editingTask.category)) {
        setCategory(editingTask.category);
        setIsAddingCustomCategory(false);
      } else {
        setCategory('Custom');
        setCustomCategory(editingTask.category);
        setIsAddingCustomCategory(true);
      }
      setDueDate(editingTask.dueDate || '');
    } else {
      // Reset form on new creation
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      setCustomCategory('');
      setIsAddingCustomCategory(false);
      
      // Default due date to today
      const todayStr = new Date().toISOString().split('T')[0];
      setDueDate(todayStr);
    }
    setErrors({});
  }, [editingTask, isOpen]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value);
    if (value === 'Custom') {
      setIsAddingCustomCategory(true);
    } else {
      setIsAddingCustomCategory(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalCategory = isAddingCustomCategory 
      ? (customCategory.trim() || 'Others') 
      : category;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category: finalCategory,
      dueDate,
      completed: editingTask ? editingTask.completed : false,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="task-form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#030604]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id="task-form-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-lg bg-[#0a0f0d] rounded-3xl border border-emerald-500/20 shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 mb-5">
              <div>
                <h3 className="text-xl font-bold text-emerald-400 tracking-tight" id="task-form-title">
                  {editingTask ? 'Edit Task Details' : 'Create New Task'}
                </h3>
                <p className="text-xs text-emerald-500/70 mt-0.5 font-medium">
                  {editingTask ? 'Modify the key priorities and attributes' : 'Add another item to your productivity pipeline'}
                </p>
              </div>
              <button
                id="close-task-form-btn"
                onClick={onClose}
                className="p-2 rounded-xl text-emerald-555 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label htmlFor="task-title-input" className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                  Task Title <span className="text-rose-450 ml-1">*</span>
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="e.g., Structure database schemas"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-emerald-950/15 text-neutral-100 font-medium placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/5 transition-all ${
                    errors.title 
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/5' 
                      : 'border-emerald-500/10 focus:border-emerald-500/40'
                  }`}
                  autoFocus
                />
                {errors.title && (
                  <p id="error-title-msg" className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full inline-block"></span>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label htmlFor="task-desc-input" className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  id="task-desc-input"
                  placeholder="Include context, check-lists, or critical milestones..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-500/10 bg-emerald-950/15 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/5 transition-all resize-none"
                />
              </div>

              {/* Grid for Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-1.5">
                  <label htmlFor="task-due-input" className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-500/70" />
                    Due Date <span className="text-rose-450 ml-0.5">*</span>
                  </label>
                  <input
                    id="task-due-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-emerald-950/15 font-medium text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/5 transition-all ${
                      errors.dueDate
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-emerald-500/10 focus:border-emerald-500/40'
                    }`}
                  />
                  {errors.dueDate && (
                    <p id="error-due-msg" className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full inline-block"></span>
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="task-category-select" className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-500/70" />
                    Category
                  </label>
                  <select
                    id="task-category-select"
                    value={isAddingCustomCategory ? 'Custom' : category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/10 bg-[#070b09] font-medium text-neutral-100 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/5 transition-all cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>
              </div>

              {/* Conditional Input for Custom Category */}
              {isAddingCustomCategory && (
                <motion.div
                  id="custom-category-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label htmlFor="task-custom-category-input" className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider">
                    Enter Custom Category Name
                  </label>
                  <input
                    id="task-custom-category-input"
                    type="text"
                    placeholder="e.g., Marketing"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/10 bg-[#070b09] text-neutral-100 font-medium placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/5 transition-all"
                  />
                </motion.div>
              )}

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-emerald-500/70" />
                  Priority Level
                </label>
                <div role="group" className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((prio) => {
                    const isSelected = priority === prio;
                    const priorityColor = {
                      low: isSelected
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 shadow-xs'
                        : 'border-emerald-500/10 text-neutral-400 hover:bg-emerald-950/20',
                      medium: isSelected
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40 shadow-xs'
                        : 'border-emerald-500/10 text-neutral-400 hover:bg-emerald-950/20',
                      high: isSelected
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40 shadow-xs'
                        : 'border-emerald-500/10 text-neutral-400 hover:bg-[#1a0a0d]',
                    }[prio];

                    return (
                      <button
                        id={`priority-btn-${prio}`}
                        key={prio}
                        type="button"
                        onClick={() => setPriority(prio)}
                        className={`py-2 px-3 rounded-xl border font-bold capitalize text-sm transition-all duration-200 cursor-pointer ${priorityColor}`}
                      >
                        {prio}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions inside form */}
              <div className="flex items-center gap-3 pt-4 border-t border-emerald-500/10 mt-6 justify-end">
                <button
                  id="cancel-form-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-emerald-500/10 text-neutral-300 hover:bg-emerald-950/30 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-form-btn"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 border border-emerald-500 text-neutral-950 hover:bg-emerald-400 font-bold text-sm transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer animate-transition"
                >
                  {editingTask ? 'Save Changes' : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
