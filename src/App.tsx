import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Wrench,
  X
} from 'lucide-react';
import { AssignmentDetailModal } from './components/assignments/AssignmentDetailModal';
import { AssignmentFormModal } from './components/assignments/AssignmentFormModal';
import { AssignmentList } from './components/assignments/AssignmentList';
import { DeclineReasonModal } from './components/assignments/DeclineReasonModal';
import { RecurringModal } from './components/assignments/RecurringModal';
import { BrotherDashboard } from './components/dashboard/BrotherDashboard';
import { CoordinatorDashboard } from './components/dashboard/CoordinatorDashboard';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { MaintenanceCalendar } from './components/calendar/MaintenanceCalendar';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ReportsAndHistory } from './components/reports/ReportsAndHistory';
import { SettingsModal } from './components/settings/SettingsModal';
import { TeamManagement } from './components/team/TeamManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  createAssignment,
  reassignAssignment,
  respondToAssignment,
  subscribeToAssignments,
  toggleChecklistItem,
  updateAssignmentStatus
} from './services/assignmentService';
import { getAppSettings, subscribeToCategories, subscribeToHalls } from './services/categoryService';
import { subscribeToNotifications } from './services/notificationService';
import { AppSetting, Assignment, AssignmentPriority, AssignmentStatus, Category, Hall, NavTab, NotificationItem } from './types';

const MainAppContent: React.FC = () => {
  const { profile, isCoordinator, isAdmin, loading: authLoading, switchPersona, allUsers } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Realtime Data state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting | null>(null);

  // Modals state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [declineModalTask, setDeclineModalTask] = useState<Assignment | null>(null);
  const [showTestGuide, setShowTestGuide] = useState(false);

  // Subscriptions
  useEffect(() => {
    const unsubAssignments = subscribeToAssignments((updated) => {
      setAssignments(updated);
      // Keep selectedAssignment synchronized if open
      if (selectedAssignment) {
        const found = updated.find(a => a.id === selectedAssignment.id);
        if (found) setSelectedAssignment(found);
      }
    }, profile);

    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    const unsubHalls = subscribeToHalls((h) => {
      setHalls(h);
    });

    getAppSettings().then(settings => setAppSettings(settings));

    return () => {
      unsubAssignments();
      unsubCategories();
      unsubHalls();
    };
  }, [profile?.uid]);

  // Notifications subscription for current user
  useEffect(() => {
    if (!profile) return;
    const unsubNotifs = subscribeToNotifications(profile.uid, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsubNotifs();
  }, [profile?.uid]);

  // Count pending responses for current user
  const myPendingTasksCount = assignments.filter(a => {
    if (!profile) return false;
    if (!a.assignedUserIds.includes(profile.uid)) return false;
    const resp = a.responses?.[profile.uid];
    return !resp || resp.status === 'pending';
  }).length;

  // Actions
  const handleCreateAssignment = async (data: {
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
  }) => {
    if (!profile) return;
    await createAssignment(data, profile);
  };

  const handleRespond = async (assignment: Assignment, status: 'accepted' | 'declined', reason?: string) => {
    if (!profile) return;
    await respondToAssignment(assignment, profile, status, reason);
  };

  const handleUpdateStatus = async (assignment: Assignment, status: AssignmentStatus, notes?: string, photos?: string[]) => {
    if (!profile) return;
    await updateAssignmentStatus(assignment, status, profile, notes, photos);
  };

  const handleToggleChecklist = async (assignment: Assignment, itemId: string, completed: boolean) => {
    if (!profile) return;
    await toggleChecklistItem(assignment, itemId, completed, profile);
  };

  const handleReassign = async (assignment: Assignment, newIds: string[], names: Record<string, string>, reason: string) => {
    if (!profile) return;
    await reassignAssignment(assignment, newIds, names, profile, reason);
  };

  const handleSelectAssignmentById = (id: string) => {
    const found = assignments.find(a => a.id === id);
    if (found) {
      setSelectedAssignment(found);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white animate-bounce shadow-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading Kingdom Hall Maintenance Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        notifications={notifications}
        onOpenNotifications={() => setCurrentTab('notifications')}
        onOpenProfile={() => setCurrentTab('profile')}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-x-hidden">
        {/* Sidebar for Desktop */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingCount={myPendingTasksCount}
          unreadNotificationsCount={notifications.filter(n => !n.read).length}
        />

        {/* Content Area with permanent bottom padding offset for fixed mobile nav */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-mobile-nav w-full max-w-full overflow-x-hidden">
          {/* Quick interactive test helper banner */}
          <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Connected to Cloud Firestore
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-500 hidden sm:inline">
                Test persona switching available in top right header
              </span>
            </div>
            <button
              onClick={() => setShowTestGuide(!showTestGuide)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showTestGuide ? 'Hide Test Guide' : 'Test Scenarios Guide'}
            </button>
          </div>

          {/* Test Scenarios Guide Drawer / Accordion */}
          {showTestGuide && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-slate-700 dark:text-slate-300 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                <span>Verified Workflow Test Scenarios:</span>
                <button onClick={() => setShowTestGuide(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">1. Coordinator Creates Task:</span> Switch to Brother Mark (Coordinator), click "+ New Assignment", assign to Brother David.
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">2. Brother Accepts/Declines:</span> Switch to Brother David, see card under "Action Required", click "Accept" or "Decline with reason".
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">3. Coordinator Sees Response:</span> Switch to Brother Mark, observe real-time response badge update and notification.
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">4. Checklist & Complete:</span> Open task, check off procedures, add notes/photo, mark "Completed".
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">5. Review & Reassign:</span> Coordinator clicks "Review & Close Task" or reassigns to another brother.
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-600">6. Audit Log & CSV:</span> Open "Reports" tab to see immutable server audit trail and download CSV.
                </div>
              </div>
            </div>
          )}

          {/* Tab Views */}
          {currentTab === 'dashboard' && (
            isCoordinator ? (
              <CoordinatorDashboard
                assignments={assignments}
                categories={categories}
                onSelectAssignment={setSelectedAssignment}
                onCreateNew={() => setIsCreatingAssignment(true)}
                onOpenRecurring={() => setIsRecurringModalOpen(true)}
                onViewAll={() => setCurrentTab('assignments')}
              />
            ) : (
              <BrotherDashboard
                assignments={assignments}
                onSelectAssignment={setSelectedAssignment}
                onRespond={handleRespond}
                onOpenDeclineModal={setDeclineModalTask}
              />
            )
          )}

          {currentTab === 'assignments' && (
            <AssignmentList
              assignments={assignments}
              categories={categories}
              onSelectAssignment={setSelectedAssignment}
              onCreateNew={() => setIsCreatingAssignment(true)}
              onOpenRecurring={() => setIsRecurringModalOpen(true)}
              onRespond={handleRespond}
              onOpenDeclineModal={setDeclineModalTask}
            />
          )}

          {currentTab === 'calendar' && (
            <MaintenanceCalendar
              assignments={assignments}
              categories={categories}
              onSelectAssignment={setSelectedAssignment}
              onOpenRecurring={() => setIsRecurringModalOpen(true)}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onSelectAssignmentById={handleSelectAssignmentById}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileScreen
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenReports={() => setCurrentTab('reports')}
            />
          )}

          {currentTab === 'team' && (
            <TeamManagement />
          )}

          {currentTab === 'reports' && (
            <ReportsAndHistory
              assignments={assignments}
              categories={categories}
              onSelectAssignment={setSelectedAssignment}
            />
          )}

          {currentTab === 'settings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-2">Facility & Application Settings</h3>
              <p className="text-xs text-slate-500 mb-4">Click button below to open the settings configuration dialog.</p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Open Settings Dialog
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Permanently Fixed Bottom Nav for Mobile Viewports */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        pendingCount={myPendingTasksCount}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
      />

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onRespond={handleRespond}
          onUpdateStatus={handleUpdateStatus}
          onToggleChecklist={handleToggleChecklist}
          onReassign={handleReassign}
          onEdit={(a) => {
            setSelectedAssignment(null);
            setEditingAssignment(a);
          }}
        />
      )}

      {/* Create / Edit Assignment Modal */}
      {(isCreatingAssignment || editingAssignment) && (
        <AssignmentFormModal
          categories={categories}
          halls={halls}
          existingAssignments={assignments}
          initialData={editingAssignment || undefined}
          onSave={handleCreateAssignment}
          onClose={() => {
            setIsCreatingAssignment(false);
            setEditingAssignment(null);
          }}
        />
      )}

      {/* Recurring Generator Modal */}
      {isRecurringModalOpen && (
        <RecurringModal
          categories={categories}
          onClose={() => setIsRecurringModalOpen(false)}
          onSuccess={() => {
            alert('Recurring maintenance assignment successfully created and scheduled.');
          }}
        />
      )}

      {/* Decline Reason Modal (when triggered from BrotherDashboard) */}
      {declineModalTask && (
        <DeclineReasonModal
          assignment={declineModalTask}
          onConfirm={async (reason) => {
            await handleRespond(declineModalTask, 'declined', reason);
            setDeclineModalTask(null);
          }}
          onClose={() => setDeclineModalTask(null)}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelectAssignmentById={handleSelectAssignmentById}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        categories={categories}
        halls={halls}
        appSettings={appSettings}
        onRefreshCategories={() => {
          // Categories will automatically update via subscription
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
