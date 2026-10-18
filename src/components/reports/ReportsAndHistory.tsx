import React, { useEffect, useState } from 'react';
import {
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Search,
  Shield,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAllAuditLogs } from '../../services/auditService';
import { Assignment, AuditLog, Category } from '../../types';
import { exportToCSV, formatDate, formatDateTime } from '../../utils/formatters';

interface ReportsAndHistoryProps {
  assignments: Assignment[];
  categories: Category[];
  onSelectAssignment: (assignment: Assignment) => void;
}

export const ReportsAndHistory: React.FC<ReportsAndHistoryProps> = ({
  assignments,
  categories,
  onSelectAssignment
}) => {
  const { isCoordinator, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'audit' | 'stats'>('history');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      setLoadingAudit(true);
      fetchAllAuditLogs()
        .then(logs => setAuditLogs(logs))
        .finally(() => setLoadingAudit(false));
    }
  }, [activeTab]);

  // Filtered maintenance history
  const filteredAssignments = assignments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchNotes = a.completionNotes?.toLowerCase().includes(q);
      const matchCat = a.category.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;

    if (dateRangeStart) {
      const itemDate = a.scheduledDate || a.createdAt;
      if (itemDate < dateRangeStart) return false;
    }
    if (dateRangeEnd) {
      const itemDate = a.scheduledDate || a.createdAt;
      if (itemDate > dateRangeEnd) return false;
    }

    return true;
  });

  // Calculate stats
  const totalTasks = assignments.length;
  const completedTasks = assignments.filter(a => a.status === 'completed' || a.status === 'reviewed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = assignments.filter(a => a.status === 'in_progress').length;

  const handleExportCSV = () => {
    const rows = filteredAssignments.map(a => ({
      ID: a.id,
      Title: a.title,
      Category: a.category,
      Hall: a.hallName || 'Central Kingdom Hall',
      Priority: a.priority,
      Status: a.status,
      CreatedBy: a.createdByName,
      AssignedBrothers: Object.values(a.assignedUserNames || {}).join('; '),
      ScheduledDate: a.scheduledDate || '',
      Deadline: a.deadline,
      CompletionNotes: a.completionNotes || '',
      CreatedAt: a.createdAt,
      UpdatedAt: a.updatedAt
    }));
    exportToCSV('Kingdom_Hall_Maintenance_Report', rows);
  };

  const handleExportAuditCSV = () => {
    const rows = auditLogs.map(l => ({
      Timestamp: l.timestamp,
      Action: l.action,
      ActorName: l.actorName,
      ActorRole: l.actorRole,
      Details: l.details,
      AssignmentId: l.assignmentId || ''
    }));
    exportToCSV('Kingdom_Hall_Audit_Log', rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Maintenance History, Reports & Audit Log
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive archive of completed tasks, compliance reports, and tamper-resistant audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'history' && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Tasks (CSV)
            </button>
          )}
          {activeTab === 'audit' && (
            <button
              onClick={handleExportAuditCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit Log (CSV)
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Archive className="w-4 h-4" /> Maintenance History ({filteredAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Workload & Metrics
        </button>
        {(isCoordinator || isAdmin) && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" /> Audit Trail ({auditLogs.length})
          </button>
        )}
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search task title, notes, or category..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed & Closed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="assigned">Assigned</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Date Range:</span>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
              />
              {(dateRangeStart || dateRangeEnd) && (
                <button
                  onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); }}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          {/* Mobile Card List (no wide tables) */}
          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No historical records found matching current criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAssignments.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAssignment(a)}
                  className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-400 cursor-pointer transition-all space-y-2 select-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {a.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                      a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                    {a.title}
                  </h4>

                  {a.completionNotes && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      "{a.completionNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="truncate max-w-[170px]">
                      {Object.values(a.assignedUserNames || {}).join(', ') || 'Unassigned'}
                    </span>
                    <span className="shrink-0">{formatDate(a.deadline)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Assignments Created</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{totalTasks}</p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <p className="text-xs text-slate-500 uppercase font-semibold">Overall Completion Rate</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{completionRate}%</p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <p className="text-xs text-slate-500 uppercase font-semibold">Currently Active</p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">{inProgressTasks}</p>
            </div>
          </div>

          {/* Category distribution */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Workload by Maintenance Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => {
                const count = assignments.filter(a => a.category === cat.name).length;
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={cat.id} className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{cat.name}</span>
                      <span className="font-semibold">{count} tasks ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Server-enforced audit records of every creation, assignment, response, checklist check, and status transition
              </p>
            </div>
          </div>

          {loadingAudit ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading audit records from Firestore...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No audit records recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {log.actorName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {log.actorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
