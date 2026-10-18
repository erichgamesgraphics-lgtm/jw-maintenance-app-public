import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateRecurringAssignment, RECURRING_TEMPLATES, RecurringTemplate } from '../../services/recurringService';
import { Category, UserProfile } from '../../types';

interface RecurringModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({ categories, onClose, onSuccess }) => {
  const { profile, allUsers } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<RecurringTemplate>(RECURRING_TEMPLATES[0]);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  );
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [selectedBrotherIds, setSelectedBrotherIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleBrother = (uid: string) => {
    setSelectedBrotherIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleGenerate = async () => {
    if (!profile) return;
    if (selectedBrotherIds.length === 0) {
      alert('Please select at least one brother to assign this recurring task to.');
      return;
    }

    setGenerating(true);
    try {
      const assignedBrothers = allUsers.filter(u => selectedBrotherIds.includes(u.uid));
      await generateRecurringAssignment(
        selectedTemplate,
        scheduledDate,
        deadline,
        assignedBrothers,
        profile,
        'default_hall',
        'Central Kingdom Hall'
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to generate recurring assignment:', err);
      alert('Failed to generate recurring assignment.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Recurring Maintenance Task Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-500">
            Select a standard Kingdom Hall recurring maintenance procedure. This will generate an actual task record with standard checklists and send notifications to assigned brothers.
          </p>

          {/* Template cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Procedure Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RECURRING_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded shrink-0">
                        {tmpl.frequency}
                      </span>
                    </div>
                    <p className="text-slate-500 line-clamp-2 text-[11px]">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Procedure Checklist Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Checklist Included ({selectedTemplate.checklist.length} items):
            </p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              {selectedTemplate.checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scheduling Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Scheduled Execution Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Completion Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          {/* Assign Brothers */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assign Brother(s) for this Occurrence
            </label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-slate-50 dark:bg-slate-900/40">
              {allUsers.map((b) => {
                const isChecked = selectedBrotherIds.includes(b.uid);
                return (
                  <div
                    key={b.uid}
                    onClick={() => toggleBrother(b.uid)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                      isChecked
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 font-medium'
                        : 'border-transparent hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-blue-600"
                      />
                      <span>{b.displayName} ({b.role})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {b.qualifications?.slice(0, 2).join(', ') || 'General'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || selectedBrotherIds.length === 0}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {generating ? 'Generating...' : 'Generate & Schedule Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
