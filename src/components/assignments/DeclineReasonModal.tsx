import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Assignment } from '../../types';

interface DeclineReasonModalProps {
  assignment: Assignment;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const COMMON_REASONS = [
  'Out of town / Traveling',
  'Work schedule conflict',
  'Illness or physical limitation',
  'Family obligations',
  'Do not have required tools / materials',
  'Not qualified for this specialized work'
];

export const DeclineReasonModal: React.FC<DeclineReasonModalProps> = ({
  assignment,
  onConfirm,
  onClose
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customExplanation, setCustomExplanation] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedPreset
      ? customExplanation
        ? `${selectedPreset} — ${customExplanation}`
        : selectedPreset
      : customExplanation || 'Brother was unable to accept at this time.';

    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Decline Assignment
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
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are declining <span className="font-semibold text-slate-900 dark:text-slate-100">"{assignment.title}"</span>. Providing a reason helps the maintenance coordinator reassign this work promptly.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Common Reasons (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_REASONS.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setSelectedPreset(selectedPreset === reason ? '' : reason)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedPreset === reason
                      ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200 font-medium'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Explanation or Note for Coordinator
            </label>
            <textarea
              rows={3}
              value={customExplanation}
              onChange={(e) => setCustomExplanation(e.target.value)}
              placeholder="e.g. Away until Tuesday, but could assist next weekend if still needed..."
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
              className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors"
            >
              Submit Decline Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
