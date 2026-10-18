import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, Category } from '../../types';
import { formatDate, isPastDeadline } from '../../utils/formatters';

interface CoordinatorDashboardProps {
  assignments: Assignment[];
  categories: Category[];
  onSelectAssignment: (assignment: Assignment) => void;
  onCreateNew: () => void;
  onOpenRecurring: () => void;
  onViewAll: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  assignments,
  categories,
  onSelectAssignment,
  onCreateNew,
  onOpenRecurring,
  onViewAll
}) => {
  const { profile } = useAuth();

  const activeAssignments = assignments.filter(a => a.status !== 'reviewed' && a.status !== 'cancelled');

  let pendingResponsesCount = 0;
  let acceptedCount = 0;
  let declinedCount = 0;

  activeAssignments.forEach(a => {
    Object.values(a.responses || {}).forEach(r => {
      if (r.status === 'pending') pendingResponsesCount++;
      if (r.status === 'accepted') acceptedCount++;
      if (r.status === 'declined') declinedCount++;
    });
  });

  const inProgressCount = activeAssignments.filter(a => a.status === 'in_progress').length;
  const completedAwaitingReview = activeAssignments.filter(a => a.status === 'completed');
  const overdueAssignments = activeAssignments.filter(a => isPastDeadline(a.deadline) && a.status !== 'completed');

  const tasksNeedingAttention = activeAssignments.filter(a => {
    const hasDecline = Object.values(a.responses || {}).some(r => r.status === 'declined');
    const isOverdue = isPastDeadline(a.deadline) && a.status !== 'completed';
    const isReadyForReview = a.status === 'completed';
    return hasDecline || isOverdue || isReadyForReview;
  });

  return (
    <div className="space-y-3.5">
      {/* Mobile-First Welcome & Quick Action Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-blue-100 mb-1">
            <Wrench className="w-3 h-3" /> Coordinator Center
          </div>
          <h2 className="text-lg font-black tracking-tight leading-snug">
            Welcome, {profile?.displayName.split(' ')[0]}
          </h2>
          <p className="text-blue-100 text-[11px]">
            Organize Kingdom Hall maintenance assignments and track brother responses.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={onCreateNew}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
          <button
            onClick={onOpenRecurring}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" /> Recurring
          </button>
        </div>
      </div>

      {/* KPI Cards: Compact 2-column phone grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Active */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {activeAssignments.length}
          </div>
          <p className="text-[10px] text-slate-400">Total Hall Tasks</p>
        </div>

        {/* Pending Response */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Responses</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {pendingResponsesCount}
          </div>
          <p className="text-[10px] text-slate-400">{declinedCount} declined</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {inProgressCount}
          </div>
          <p className="text-[10px] text-slate-400">{acceptedCount} accepted</p>
        </div>

        {/* Review Needed */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">To Review</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {completedAwaitingReview.length}
          </div>
          <p className="text-[10px] text-slate-400">Completed work</p>
        </div>
      </div>

      {/* Attention Required Banner on Phone */}
      {tasksNeedingAttention.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Needs Attention ({tasksNeedingAttention.length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {tasksNeedingAttention.slice(0, 3).map((task) => {
              const hasDecline = Object.values(task.responses || {}).some(r => r.status === 'declined');
              const isOverdue = isPastDeadline(task.deadline) && task.status !== 'completed';
              const isReadyForReview = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectAssignment(task)}
                  className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-xs cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {task.category} • Due {formatDate(task.deadline)}
                    </p>
                    {hasDecline && (
                      <p className="text-[10px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> A brother declined — reassign needed
                      </p>
                    )}
                    {isReadyForReview && !hasDecline && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        Work completed — review & close
                      </p>
                    )}
                  </div>

                  <span className="min-h-[36px] px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-[11px] font-bold flex items-center shrink-0">
                    Open
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Workload List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            Ongoing Maintenance Tasks
          </h3>
          <button
            onClick={onViewAll}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
          >
            View All ({assignments.length}) →
          </button>
        </div>

        {activeAssignments.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            No active maintenance tasks. Tap "+ New Task" to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {activeAssignments.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectAssignment(task)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {task.category} • {Object.values(task.assignedUserNames || {}).join(', ') || 'Unassigned'}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  task.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
