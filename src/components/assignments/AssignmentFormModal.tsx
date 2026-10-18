import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Plus,
  Trash2,
  UserPlus,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkScheduleConflicts } from '../../services/recurringService';
import { Assignment, AssignmentPriority, Category, Hall } from '../../types';

interface AssignmentFormModalProps {
  categories: Category[];
  halls: Hall[];
  existingAssignments: Assignment[];
  initialData?: Assignment;
  onSave: (data: {
    title: string;
    description: string;
    category: string;
    hallId: string;
    hallName?: string;
    assignedUserIds: string[];
    assignedUserNames?: Record<string, string>;
    scheduledDate?: string;
    scheduledTime?: string;
    deadline: string;
    priority: AssignmentPriority;
    checklist?: string[];
    instructions?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  categories,
  halls,
  existingAssignments,
  initialData,
  onSave,
  onClose
}) => {
  const { allUsers } = useAuth();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (categories[0]?.name || 'Cleaning & Janitorial'));
  const [hallId, setHallId] = useState(initialData?.hallId || (halls[0]?.id || 'default_hall'));
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(initialData?.assignedUserIds || []);
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledDate || '');
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || '09:00');
  const [deadline, setDeadline] = useState(initialData?.deadline || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [priority, setPriority] = useState<AssignmentPriority>(initialData?.priority || 'normal');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [checklistItems, setChecklistItems] = useState<string[]>(
    initialData?.checklist?.map(c => c.text) || ['Inspect area before commencing work', 'Perform required maintenance', 'Clean up and return tools']
  );
  const [newChecklistText, setNewChecklistText] = useState('');
  const [saving, setSaving] = useState(false);

  // Check for conflicts
  const conflicts = checkScheduleConflicts(
    existingAssignments,
    assignedUserIds,
    scheduledDate,
    initialData?.id
  );

  const selectedCategoryObj = categories.find(c => c.name === category);

  const toggleBrother = (uid: string) => {
    setAssignedUserIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const addChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklistItems(prev => [...prev, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an assignment title.');
      return;
    }
    if (!category) {
      alert('Please select a category.');
      return;
    }
    if (!deadline) {
      alert('Please set a deadline.');
      return;
    }

    const nameMap: Record<string, string> = {};
    assignedUserIds.forEach(id => {
      const u = allUsers.find(user => user.uid === id);
      nameMap[id] = u?.displayName || 'Brother';
    });

    const targetHall = halls.find(h => h.id === hallId);

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        hallId,
        hallName: targetHall?.name || 'Central Kingdom Hall',
        assignedUserIds,
        assignedUserNames: nameMap,
        scheduledDate,
        scheduledTime,
        deadline,
        priority,
        checklist: checklistItems,
        instructions: instructions.trim()
      });
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 my-auto sm:my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {initialData ? 'Edit Maintenance Assignment' : 'Create New Maintenance Assignment'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Fill in task specifications and assign to qualified brothers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inspect and Replace Rooftop HVAC Filters"
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Maintenance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {selectedCategoryObj?.requiredQualifications && selectedCategoryObj.requiredQualifications.length > 0 && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                  Suggested qualification: {selectedCategoryObj.requiredQualifications.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 capitalize"
              >
                <option value="low">Low (Routine maintenance)</option>
                <option value="normal">Normal (Standard priority)</option>
                <option value="high">High (Needs timely attention)</option>
                <option value="urgent">Urgent (Safety / immediate fix)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Scope of Work / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be inspected, serviced, or repaired..."
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assign Brothers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Assign Brother(s)
              </label>
              <span className="text-xs text-slate-400">
                {assignedUserIds.length} selected
              </span>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-900/40 max-h-44 overflow-y-auto space-y-1.5">
              {allUsers.map((brother) => {
                const isChecked = assignedUserIds.includes(brother.uid);
                // Check if qualifications match category
                const hasMatchingQual = selectedCategoryObj?.requiredQualifications?.some(
                  q => brother.qualifications?.includes(q)
                );

                return (
                  <div
                    key={brother.uid}
                    onClick={() => toggleBrother(brother.uid)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border text-xs transition-colors ${
                      isChecked
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 font-medium'
                        : 'border-transparent hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                          {brother.displayName}
                        </span>
                        <span className="text-slate-400 ml-1.5">
                          ({brother.role}) • {brother.congregation}
                        </span>
                      </div>
                    </div>
                    {hasMatchingQual && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Qualified for Category
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates & Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Scheduled Date (Optional)
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
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Schedule Conflict Warning</p>
                {conflicts.map((c, i) => {
                  const b = allUsers.find(u => u.uid === c.userId);
                  return (
                    <p key={i}>
                      • <span className="font-medium">{b?.displayName || 'Brother'}</span> already has an assignment on {scheduledDate}: "{c.assignmentTitle}".
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checklist Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Task Checklist Procedures
            </label>
            <div className="space-y-2 mb-2">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span className="font-mono text-slate-400 w-4 text-center">{index + 1}.</span>
                  <span className="flex-1 text-slate-800 dark:text-slate-200">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Add checklist procedure item (e.g. Test emergency shutoff switch)..."
                className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Safety Guidelines & Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Ladder safety required. Lockout/tagout circuit breaker #14 before opening housing..."
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : initialData ? 'Update Assignment' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
