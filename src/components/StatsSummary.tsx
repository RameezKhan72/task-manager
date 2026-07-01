import { motion } from 'motion/react';
import { ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface StatsSummaryProps {
  tasks: Task[];
}

export default function StatsSummary({ tasks }: StatsSummaryProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  // Overdue calculation (incomplete and due date is before today)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-neutral-200 bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: completed,
      suffix: `(${percentComplete}%)`,
      icon: CheckCircle2,
      color: 'text-emerald-300 bg-emerald-950/30 border-emerald-500/25 hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'pending',
      title: 'Active Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-200 bg-amber-950/15 border-amber-500/10 hover:border-amber-500/25',
      iconColor: 'text-amber-400',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: overdue,
      icon: AlertCircle,
      color: overdue > 0 
        ? 'text-rose-300 bg-rose-950/20 border-rose-500/25 hover:border-rose-500/45' 
        : 'text-neutral-400 bg-neutral-950/10 border-neutral-800',
      iconColor: overdue > 0 ? 'text-rose-450' : 'text-neutral-550',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="space-y-5">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              id={`stat-card-${card.id}`}
              key={card.id}
              variants={itemVariants}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${card.color} shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-tight uppercase opacity-80">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.iconColor} bg-emerald-950/60 border border-emerald-500/10 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5 text-neutral-100">
                <span className="text-2xl md:text-3xl font-bold tracking-tight">{card.value}</span>
                {card.suffix && (
                  <span className="text-xs font-semibold tracking-normal opacity-75">{card.suffix}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modern thin progress bar detailing completeness */}
      <div className="bg-emerald-950/50 border border-emerald-500/10 rounded-full h-1.5 overflow-hidden w-full relative">
        <motion.div 
          id="completion-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
        />
      </div>
    </div>
  );
}
