import React, { useState } from 'react';
import { RefreshCw, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, UserProfile } from '../../types';

interface ReassignModalProps {
  assignment: Assignment;
  onConfirm: (newAssignedIds: string[], newNames: Record<string, string>, reason: string) => void;
  onClose: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  assignment,
  onConfirm,
  onClose
}) => {
  const { allUsers } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reason, setReason] = useState<string>('');

  const eligibleBrothers = allUsers.filter(u => u.role === 'brother' || u.role === 'coordinator');

  const toggleBrother = (uid: string) => {
    setSelectedIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert('Please select at least one brother to reassign this task to.');
      return;
    }

    const nameMap: Record<string, string> = {};
    selectedIds.forEach(id => {
      const u = allUsers.find(user => user.uid === id);
      nameMap[id] = u?.displayName || 'Brother';
    });

    onConfirm(selectedIds, nameMap, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Reassign Maintenance Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Reassigning <span className="font-semibold text-slate-900 dark:text-slate-100">"{assignment.title}"</span>.
              The task history and previous decline reasons will remain preserved in the audit log.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select New Assigned Brother(s)
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-900/50">
              {eligibleBrothers.map((brother) => {
                const isChecked = selectedIds.includes(brother.uid);
                const wasPreviouslyAssigned = assignment.assignedUserIds.includes(brother.uid);
                return (
                  <div
                    key={brother.uid}
                    onClick={() => toggleBrother(brother.uid)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer border transition-colors ${
                      isChecked
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                        : 'border-transparent hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {brother.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {brother.congregation} • {brother.qualifications?.slice(0, 2).join(', ') || 'General'}
                        </p>
                      </div>
                    </div>
                    {wasPreviouslyAssigned && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Previously assigned
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Reassignment Note (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Reassigned due to Brother David traveling this week."
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors"
            >
              Confirm Reassignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
