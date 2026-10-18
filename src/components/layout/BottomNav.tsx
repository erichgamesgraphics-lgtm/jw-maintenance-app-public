import React from 'react';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { NavTab } from '../../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount?: number;
  unreadNotificationsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
  unreadNotificationsCount = 0
}) => {
  // Standard 5 phone tabs permanently visible on all devices
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Home',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'assignments' as NavTab,
      label: 'My Tasks',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'notifications' as NavTab,
      label: 'Notices',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: UserCheck,
      badge: null
    }
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom,0px)] fixed-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)'
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              type="button"
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all select-none touch-manipulation min-h-[44px] ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active top pill indicator */}
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}

              <div className="relative mt-1">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 scale-110'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[11px] mt-1 leading-none tracking-tight truncate max-w-[64px] ${
                  isActive ? 'font-extrabold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
