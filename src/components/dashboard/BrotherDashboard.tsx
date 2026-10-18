import React from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment } from '../../types';
import { formatDate, isPastDeadline } from '../../utils/formatters';

interface BrotherDashboardProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onRespond: (assignment: Assignment, status: 'accepted' | 'declined', reason?: string) => Promise<void>;
  onOpenDeclineModal: (assignment: Assignment) => void;
}

export const BrotherDashboard: React.FC<BrotherDashboardProps> = ({
  assignments,
  onSelectAssignment,
  onRespond,
  onOpenDeclineModal
}) => {
  const { profile } = useAuth();

  if (!profile) return null;

  // Filter tasks assigned to current brother
  const myAssignments = assignments.filter(a => a.assignedUserIds.includes(profile.uid));

  // Pending response
  const pendingResponseTasks = myAssignments.filter(a => {
    const resp = a.responses?.[profile.uid];
    return !resp || resp.status === 'pending';
  });

  // Active / accepted / in progress
  const activeTasks = myAssignments.filter(a => {
    const resp = a.responses?.[profile.uid];
    return resp?.status === 'accepted' && a.status !== 'completed' && a.status !== 'reviewed' && a.status !== 'cancelled';
  });

  // Completed / reviewed
  const completedTasks = myAssignments.filter(a => a.status === 'completed' || a.status === 'reviewed');

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-950/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold text-emerald-100 mb-2">
          <UserCheck className="w-3.5 h-3.5" /> Maintenance Servant / Volunteer
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Hello, {profile.displayName}
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
          Thank you for maintaining our place of worship. Below are your Kingdom Hall assignments and schedules.
        </p>

        {/* Quick summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
          <div className="bg-white/15 backdrop-blur p-3 rounded-xl">
            <p className="text-[11px] text-emerald-100">Awaiting Response</p>
            <p className="text-xl font-black">{pendingResponseTasks.length}</p>
          </div>
          <div className="bg-white/15 backdrop-blur p-3 rounded-xl">
            <p className="text-[11px] text-emerald-100">In Progress</p>
            <p className="text-xl font-black">{activeTasks.length}</p>
          </div>
          <div className="bg-white/15 backdrop-blur p-3 rounded-xl">
            <p className="text-[11px] text-emerald-100">Completed</p>
            <p className="text-xl font-black">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Awaiting Brother's Response (Action Required!) */}
      {pendingResponseTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Action Required: Please Respond to Assignments ({pendingResponseTasks.length})
            </h3>
            <span className="text-xs text-amber-600 font-semibold">Immediate response needed</span>
          </div>

          <div className="space-y-3">
            {pendingResponseTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-700 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {task.category}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                        {task.priority} Priority
                      </span>
                    </div>
                    <h4
                      onClick={() => onSelectAssignment(task)}
                      className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assigned by {task.createdByName} • Deadline: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(task.deadline)}</span>
                    </p>
                  </div>

                  {task.scheduledDate && (
                    <div className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                      <p className="text-slate-400 text-[10px]">Scheduled Date</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(task.scheduledDate)} {task.scheduledTime || ''}
                      </p>
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onRespond(task, 'accepted')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" /> Accept Assignment
                  </button>
                  <button
                    onClick={() => onOpenDeclineModal(task)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 text-red-600 border border-red-300 dark:border-red-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" /> Decline with Reason
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Work / In Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          My Active Assignments ({activeTasks.length})
        </h3>

        {activeTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No active assignments pending. Check "Action Required" above or check the calendar for upcoming dates.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((task) => {
              const total = task.checklist?.length || 0;
              const done = task.checklist?.filter(c => c.completed).length || 0;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;
              const overdue = isPastDeadline(task.deadline);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectAssignment(task)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-500 cursor-pointer transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {task.category}
                    </span>
                    {overdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded uppercase">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deadline: {formatDate(task.deadline)}
                    </p>
                  </div>

                  {/* Checklist progress */}
                  {total > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Checklist Progress</span>
                        <span>{done}/{total} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>Open Details & Checklist →</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize text-[10px]">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Recently Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectAssignment(task)}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {task.category} • Completed on {formatDate(task.updatedAt)}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {task.status === 'reviewed' ? 'Reviewed & Closed' : 'Completed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
