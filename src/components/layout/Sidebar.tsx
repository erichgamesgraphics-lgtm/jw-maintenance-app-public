import React from 'react';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  FileSpreadsheet,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { NavTab } from '../../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount?: number;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, pendingCount = 0, unreadNotificationsCount = 0 }) => {
  const { isCoordinator, isBrother, isAdmin, profile } = useAuth();

  const coordinatorNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments' as NavTab, label: 'Assignments', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'calendar' as NavTab, label: 'Calendar & Schedule', icon: CalendarDays },
    { id: 'notifications' as NavTab, label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { id: 'profile' as NavTab, label: 'My Profile', icon: UserCheck },
    { id: 'team' as NavTab, label: 'Brothers & Roles', icon: Users },
    { id: 'reports' as NavTab, label: 'History & Reports', icon: FileSpreadsheet },
    { id: 'settings' as NavTab, label: 'Hall Settings', icon: Settings },
  ];

  const brotherNavItems = [
    { id: 'dashboard' as NavTab, label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'assignments' as NavTab, label: 'My Assignments', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'calendar' as NavTab, label: 'Maintenance Schedule', icon: CalendarDays },
    { id: 'notifications' as NavTab, label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { id: 'profile' as NavTab, label: 'My Profile', icon: UserCheck },
    { id: 'reports' as NavTab, label: 'Service History', icon: FileSpreadsheet },
    { id: 'team' as NavTab, label: 'Team & Qualifications', icon: Users },
  ];

  const items = isCoordinator ? coordinatorNavItems : brotherNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
      <div className="mb-6 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Logged In As</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {profile?.displayName}
        </p>
        <p className="text-xs text-slate-500 capitalize">{profile?.role} • {profile?.congregation}</p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white text-blue-600' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Security notice bottom card */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>Kingdom Hall Hub</span>
          </div>
          <p>Role-based access enforced via Firebase Cloud Firestore Security Rules.</p>
        </div>
      </div>
    </aside>
  );
};
