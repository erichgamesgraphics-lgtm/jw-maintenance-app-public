import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  MessageSquare,
  Play,
  RefreshCw,
  Shield,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, AssignmentStatus, ChecklistItem, UserProfile } from '../../types';
import { formatDate, formatDateTime, isPastDeadline } from '../../utils/formatters';
import { DeclineReasonModal } from './DeclineReasonModal';
import { ReassignModal } from './ReassignModal';

interface AssignmentDetailModalProps {
  assignment: Assignment;
  onClose: () => void;
  onRespond: (assignment: Assignment, status: 'accepted' | 'declined', reason?: string) => Promise<void>;
  onUpdateStatus: (assignment: Assignment, status: AssignmentStatus, notes?: string, photos?: string[]) => Promise<void>;
  onToggleChecklist: (assignment: Assignment, itemId: string, completed: boolean) => Promise<void>;
  onReassign: (assignment: Assignment, newIds: string[], names: Record<string, string>, reason: string) => Promise<void>;
  onEdit?: (assignment: Assignment) => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  onClose,
  onRespond,
  onUpdateStatus,
  onToggleChecklist,
  onReassign,
  onEdit
}) => {
  const { profile, isCoordinator, isAdmin } = useAuth();

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(assignment.completionNotes || '');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(assignment.completionPhotos || []);
  const [actionLoading, setActionLoading] = useState(false);

  const isAssignedToMe = profile ? assignment.assignedUserIds.includes(profile.uid) : false;
  const myResponse = profile ? assignment.responses?.[profile.uid] : null;
  const isOverdue = isPastDeadline(assignment.deadline) && assignment.status !== 'completed' && assignment.status !== 'reviewed';

  const completedChecklistCount = assignment.checklist.filter(c => c.completed).length;
  const totalChecklistCount = assignment.checklist.length;
  const progressPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  // Handle Photo Upload (Convert to compressed Base64 data URL for free tier storage)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBrotherAccept = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await onRespond(assignment, 'accepted');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBrotherDeclineConfirm = async (reason: string) => {
    setShowDeclineModal(false);
    if (!profile) return;
    setActionLoading(true);
    try {
      await onRespond(assignment, 'declined', reason);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWorkSubmit = async () => {
    setActionLoading(true);
    try {
      await onUpdateStatus(assignment, 'completed', completionNotes, uploadedPhotos);
      setShowCompletionForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Status visual steps
  const steps: { key: AssignmentStatus; label: string }[] = [
    { key: 'draft', label: 'Draft' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'reviewed', label: 'Reviewed' }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === assignment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 my-auto sm:my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar with category and close */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {assignment.category}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              assignment.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
              assignment.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {assignment.priority} Priority
            </span>
            {isOverdue && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                OVERDUE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {assignment.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Created by {assignment.createdByName} on {formatDate(assignment.createdAt)}
            </p>
            {assignment.description && (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {assignment.description}
              </p>
            )}
          </div>

          {/* Workflow Stepper */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Workflow Status: <span className="text-blue-600 font-bold uppercase">{assignment.status.replace('_', ' ')}</span>
            </p>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = assignment.status === step.key;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] mt-1.5 font-medium ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Dates & Location Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Building className="w-3.5 h-3.5" />
                <span>Kingdom Hall</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {assignment.hallName || 'Central Kingdom Hall'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Scheduled Work Date</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {assignment.scheduledDate ? `${formatDate(assignment.scheduledDate)} ${assignment.scheduledTime || ''}` : 'Flexible'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline</span>
              </div>
              <p className={`font-semibold ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                {formatDate(assignment.deadline)}
              </p>
            </div>
          </div>

          {/* Assigned Brothers & Independent Response Tracking */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Assigned Brothers ({assignment.assignedUserIds.length})
              </h4>
              <span className="text-xs text-slate-400">Independent response per brother</span>
            </div>
            <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30">
              {assignment.assignedUserIds.map((uid) => {
                const brotherName = assignment.assignedUserNames?.[uid] || 'Brother';
                const resp = assignment.responses?.[uid];
                const status = resp?.status || 'pending';

                return (
                  <div
                    key={uid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {brotherName}
                        </span>
                        {profile?.uid === uid && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            You
                          </span>
                        )}
                      </div>
                      {resp?.respondedAt && (
                        <p className="text-[10px] text-slate-400">
                          Responded on {formatDateTime(resp.respondedAt)}
                        </p>
                      )}
                      {status === 'declined' && resp?.reason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 italic">
                          Decline note: "{resp.reason}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </span>
                      ) : status === 'declined' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                          <AlertCircle className="w-3.5 h-3.5" /> Declined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Response
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt for assigned brother if response is pending */}
          {isAssignedToMe && (!myResponse || myResponse.status === 'pending') && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Your Response is Requested
                </h4>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                  Please let the maintenance coordinator know if you are able to take on this assignment.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBrotherAccept}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> Accept Assignment
                </button>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" /> Decline with Reason
                </button>
              </div>
            </div>
          )}

          {/* Interactive Checklist */}
          {assignment.checklist && assignment.checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Maintenance Checklist ({completedChecklistCount}/{totalChecklistCount})
                </h4>
                <span className="text-xs font-semibold text-blue-600">{progressPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-2">
                {assignment.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isAssignedToMe || isCoordinator) {
                        onToggleChecklist(assignment, item.id, !item.completed);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      item.completed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    } ${isAssignedToMe || isCoordinator ? 'cursor-pointer hover:border-blue-400' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // handled by parent div
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs">
                      <p className={`font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.text}
                      </p>
                      {item.completed && item.completedBy && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Completed by {item.completedBy} {item.completedAt ? `(${formatDateTime(item.completedAt)})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {assignment.instructions && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Instructions & Precautions:
              </p>
              <p>{assignment.instructions}</p>
            </div>
          )}

          {/* Completion Notes & Photos */}
          {(assignment.completionNotes || (assignment.completionPhotos && assignment.completionPhotos.length > 0)) && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Completion Report
              </h4>
              {assignment.completionNotes && (
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {assignment.completionNotes}
                </p>
              )}
              {assignment.completionPhotos && assignment.completionPhotos.length > 0 && (
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5">Completion Photos ({assignment.completionPhotos.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {assignment.completionPhotos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Completion record"
                        className="rounded-lg object-cover h-28 w-full border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion Form (when brother clicks "Complete Task") */}
          {showCompletionForm && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Submit Completed Work
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Add any notes about materials used, observations, or follow-up needed.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Completion Notes
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Changed 4 MERV 11 filters on Unit 1 and 2. Drain lines cleared. No unusual motor vibrations."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Attach Photo Records (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadedPhotos.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto py-1">
                    {uploadedPhotos.map((img, idx) => (
                      <div key={idx} className="relative shrink-0">
                        <img src={img} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteWorkSubmit}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Confirm & Mark Completed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Coordinator actions */}
            {isCoordinator && (
              <>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reassign Task
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(assignment)}
                    className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Edit Details
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Brother workflow buttons */}
            {isAssignedToMe && assignment.status === 'assigned' && myResponse?.status === 'accepted' && (
              <button
                onClick={() => onUpdateStatus(assignment, 'in_progress')}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" /> Start Work
              </button>
            )}

            {isAssignedToMe && (assignment.status === 'in_progress' || myResponse?.status === 'accepted') && assignment.status !== 'completed' && assignment.status !== 'reviewed' && !showCompletionForm && (
              <button
                onClick={() => setShowCompletionForm(true)}
                className="min-h-[44px] px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
            )}

            {/* Coordinator review action */}
            {isCoordinator && assignment.status === 'completed' && (
              <button
                onClick={() => onUpdateStatus(assignment, 'reviewed')}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Review & Close Task
              </button>
            )}

            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showDeclineModal && (
        <DeclineReasonModal
          assignment={assignment}
          onConfirm={handleBrotherDeclineConfirm}
          onClose={() => setShowDeclineModal(false)}
        />
      )}

      {showReassignModal && (
        <ReassignModal
          assignment={assignment}
          onConfirm={async (newIds, names, reason) => {
            setShowReassignModal(false);
            await onReassign(assignment, newIds, names, reason);
          }}
          onClose={() => setShowReassignModal(false)}
        />
      )}
    </div>
  );
};
