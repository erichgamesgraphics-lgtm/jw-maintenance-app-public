import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, AssignmentPriority, AssignmentStatus, Category } from '../../types';
import { formatDate, isPastDeadline } from '../../utils/formatters';

interface AssignmentListProps {
  assignments: Assignment[];
  categories: Category[];
  onSelectAssignment: (assignment: Assignment) => void;
  onCreateNew: () => void;
  onOpenRecurring: () => void;
  onRespond?: (assignment: Assignment, status: 'accepted' | 'declined', reason?: string) => Promise<void>;
  onOpenDeclineModal?: (assignment: Assignment) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  categories,
  onSelectAssignment,
  onCreateNew,
  onOpenRecurring,
  onRespond,
  onOpenDeclineModal
}) => {
  const { profile, isCoordinator } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyMyTasks, setOnlyMyTasks] = useState(!isCoordinator);

  // Filter logic
  const filtered = assignments.filter((item) => {
    if (onlyMyTasks && profile && !item.assignedUserIds.includes(profile.uid)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchBrothers = Object.values(item.assignedUserNames || {}).some(name => name.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCat && !matchBrothers) return false;
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (selectedStatus === 'overdue') {
      return isPastDeadline(item.deadline) && item.status !== 'completed' && item.status !== 'reviewed';
    } else if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: AssignmentStatus, deadline: string) => {
    const isOverdue = isPastDeadline(deadline) && status !== 'completed' && status !== 'reviewed';
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
          <AlertCircle className="w-2.5 h-2.5 text-red-600" /> Overdue
        </span>
      );
    }
    switch (status) {
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="w-2.5 h-2.5" /> Pending Response
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <Wrench className="w-2.5 h-2.5" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5" /> Completed
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <CheckCircle2 className="w-2.5 h-2.5" /> Reviewed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header and Quick Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {onlyMyTasks ? 'My Tasks' : 'All Assignments'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>

        {isCoordinator && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenRecurring}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              title="Recurring Tasks"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Recurring</span>
            </button>
            <button
              onClick={onCreateNew}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1 shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, categories, or brothers..."
            className="w-full pl-9 pr-3 min-h-[44px] text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mobile dropdown filters in 2 columns */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Pending Response</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {isCoordinator && (
          <button
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
              onlyMyTasks
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {onlyMyTasks ? 'Showing: My Assigned Tasks Only' : 'Showing: All Congregation Tasks'}
          </button>
        )}
      </div>

      {/* Single-Column Phone Stack of Task Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
          <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No tasks found</p>
          <p className="mt-0.5 text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isAssignedToMe = profile ? item.assignedUserIds.includes(profile.uid) : false;
            const myResp = profile ? item.responses?.[profile.uid] : null;
            const needsMyResponse = isAssignedToMe && (!myResp || myResp.status === 'pending');
            const totalCheck = item.checklist?.length || 0;
            const doneCheck = item.checklist?.filter(c => c.completed).length || 0;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs space-y-3 select-none"
              >
                {/* Header row */}
                <div
                  onClick={() => onSelectAssignment(item)}
                  className="cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.category}
                    </span>
                    {getStatusBadge(item.status, item.deadline)}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Info row: Assignees & Deadline */}
                <div
                  onClick={() => onSelectAssignment(item)}
                  className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {Object.values(item.assignedUserNames || {}).join(', ') || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(item.deadline)}</span>
                  </div>
                </div>

                {/* Prominent One-Touch Response Buttons for Assigned Brother right on card */}
                {needsMyResponse && onRespond && onOpenDeclineModal && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRespond(item, 'accepted');
                      }}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ThumbsUp className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDeclineModal(item);
                      }}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-red-600 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <ThumbsDown className="w-4 h-4" /> Decline
                    </button>
                  </div>
                )}

                {/* Tap to open details banner */}
                <div
                  onClick={() => onSelectAssignment(item)}
                  className="pt-1 flex items-center justify-between text-[11px] text-blue-600 font-semibold cursor-pointer"
                >
                  <span>Open task details & checklist</span>
                  {totalCheck > 0 && (
                    <span className="text-slate-400 font-normal">
                      Checklist: {doneCheck}/{totalCheck}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
