import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, Calendar, AlertCircle, Check, Circle, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface TaskItemProps {
  key?: string;
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const getCategoryStyle = (category: string) => {
  const norm = category.toLowerCase().trim();
  switch (norm) {
    case 'work':
      return { container: 'bg-blue-950/20 text-blue-300 border-blue-500/10', dot: 'bg-blue-400' };
    case 'personal':
      return { container: 'bg-purple-950/20 text-purple-300 border-purple-500/10', dot: 'bg-purple-400' };
    case 'shopping':
      return { container: 'bg-amber-950/25 text-amber-300 border-amber-500/10', dot: 'bg-amber-400' };
    case 'health':
      return { container: 'bg-rose-950/20 text-rose-300 border-rose-500/10', dot: 'bg-rose-400' };
    case 'finance':
      return { container: 'bg-emerald-950/30 text-emerald-300 border-emerald-500/25', dot: 'bg-emerald-400' };
    default:
      return { container: 'bg-neutral-900/40 text-neutral-300 border-neutral-800', dot: 'bg-neutral-500' };
  }
};

const getPriorityStyle = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high':
      return 'bg-rose-950/20 text-rose-300 border-rose-500/15';
    case 'medium':
      return 'bg-amber-950/15 text-amber-300 border-amber-500/10';
    case 'low':
      return 'bg-emerald-950/10 text-emerald-300 border-emerald-500/5';
  }
};

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const catStyle = getCategoryStyle(task.category);
  const prioStyle = getPriorityStyle(task.priority);

  // Compute status indices for due date
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate === todayStr;

  // Format date nicely e.g., "May 31, 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // keep consistent with input selection
    });
  };

  return (
    <motion.div
      id={`task-item-${task.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative p-5 rounded-3xl border shadow-xs hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        task.completed 
          ? 'bg-emerald-950/5 border-emerald-500/5 hover:bg-emerald-950/10' 
          : 'bg-[#0b120f] border-emerald-500/10 hover:border-emerald-500/25'
      }`}
    >
      {/* Task core: checkbox, title, tags */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Customized completion toggle button */}
        <button
          id={`toggle-btn-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer mt-0.5 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-neutral-950 scale-100'
              : 'border-emerald-500/30 group-hover:border-emerald-500/60 hover:bg-emerald-950/30'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3px]" />}
        </button>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Title */}
            <h4
              id={`task-title-${task.id}`}
              className={`font-semibold text-base leading-tight break-words select-none cursor-pointer flex-1 min-w-0 ${
                task.completed
                  ? 'text-neutral-500 line-through decoration-neutral-600'
                  : 'text-neutral-100'
              }`}
              onClick={() => onToggleComplete(task.id)}
            >
              {task.title}
            </h4>
          </div>

          {/* Description */}
          {task.description && (
            <p
              id={`task-desc-${task.id}`}
              className={`text-sm break-words leading-relaxed max-w-full ${
                task.completed ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Badges/Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Category tag */}
            <span
              id={`task-tag-cat-${task.id}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border font-mono ${catStyle.container}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {task.category}
            </span>

            {/* Priority level badge */}
            <span
              id={`task-tag-prio-${task.id}`}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border font-mono ${prioStyle}`}
            >
              {task.priority} Priority
            </span>

            {/* Overdue/Due banner info inside tags */}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-rose-300 bg-rose-950/20 border border-rose-500/20 font-mono">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
            {isDueToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-amber-300 bg-amber-950/20 border border-amber-500/20 font-mono">
                <AlertCircle className="w-3 h-3" />
                Due Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task actions: due date, edit, delete */}
      <div className="flex items-center justify-between md:justify-end gap-4 border-t border-emerald-500/5 md:border-0 pt-3 md:pt-0">
        {/* Due date marker */}
        {task.dueDate && (
          <div
            id={`task-due-container-${task.id}`}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              task.completed
                ? 'text-neutral-500 bg-emerald-950/5 px-2 py-1.5 rounded-xl border border-emerald-500/5'
                : isOverdue
                ? 'text-rose-300 font-bold bg-rose-950/20 px-2 py-1.5 rounded-xl border border-rose-500/25'
                : isDueToday
                ? 'text-amber-300 font-bold bg-amber-950/20 px-2 py-1.5 rounded-xl border border-amber-500/25'
                : 'text-emerald-300 bg-emerald-950/20 px-2 py-1.5 rounded-xl border border-emerald-500/15'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-mono">{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Buttons drawer */}
        <div className="flex items-center gap-1">
          {isDeleting ? (
            <div id={`del-confirm-${task.id}`} className="bg-[#0f1d17] border border-emerald-500/20 rounded-xl p-1 flex items-center gap-1.5 shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase px-1">Sure?</span>
              <button
                id={`confirm-del-btn-${task.id}`}
                onClick={() => onDelete(task.id)}
                className="px-2.5 py-1 text-xs font-bold text-neutral-950 bg-rose-500 hover:bg-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                id={`cancel-del-btn-${task.id}`}
                onClick={() => setIsDeleting(false)}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-300 bg-[#0e1713] border border-emerald-500/10 hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <>
              {/* Edit button */}
              <button
                id={`edit-btn-${task.id}`}
                onClick={() => onEdit(task)}
                className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
                title="Edit task attributes"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Trigger delete state */}
              <button
                id={`trigger-del-${task.id}`}
                onClick={() => setIsDeleting(true)}
                className="p-2 text-neutral-400 hover:text-rose-450 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                title="Delete task item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
