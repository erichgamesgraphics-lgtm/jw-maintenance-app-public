import React, { useState } from 'react';
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Shield,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem } from '../../types';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onOpenNotifications,
  onOpenProfile
}) => {
  const { profile, isAdmin, isCoordinator, switchPersona, allUsers } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
          <Shield className="w-2.5 h-2.5" /> Admin
        </span>
      );
    }
    if (isCoordinator) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          <Wrench className="w-2.5 h-2.5" /> Coord
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        <UserCheck className="w-2.5 h-2.5" /> Brother
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 select-none">
      <div className="w-full max-w-md mx-auto px-3.5 h-14 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none truncate">
                KH Maintenance
              </h1>
              {roleBadge()}
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {profile?.congregation || 'Kingdom Hall'}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick persona switch for instant multi-device workflow testing */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Switch user account"
              aria-label="Switch account"
            >
              <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate max-w-[55px]">
                  {profile?.displayName.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </button>

            {showPersonaMenu && (
              <div className="fixed inset-x-4 top-16 z-50 max-w-sm mx-auto bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Member Persona
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Test accepting/declining tasks from different brother accounts.
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {allUsers.map((u) => {
                    const isSelected = profile?.uid === u.uid;
                    return (
                      <button
                        key={u.uid}
                        onClick={() => {
                          switchPersona(u.uid);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full min-h-[44px] text-left px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/30 font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{u.displayName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {u.role} • {u.congregation}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
            aria-label="User Profile"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {profile?.displayName.charAt(0) || 'B'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
