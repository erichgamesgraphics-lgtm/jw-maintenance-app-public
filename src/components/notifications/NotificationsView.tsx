import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Smartphone,
  Wrench
} from 'lucide-react';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onSelectAssignmentById: (assignmentId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onSelectAssignmentById
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filterUnreadOnly ? notifications.filter(n => !n.read) : notifications;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(notifications);
  };

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.read) {
      await markNotificationAsRead(item.id);
    }
    if (item.assignmentId) {
      onSelectAssignmentById(item.assignmentId);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'declined':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'status_change':
        return <RefreshCw className="w-4 h-4 text-indigo-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Notifications & Announcements
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time assignment updates, brother responses, schedule reminders, and completion notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterUnreadOnly
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>
        </div>
      </div>

      {/* Push Notification & Mobile Support Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Mobile Device & Push Notification Delivery</span>
        </div>
        <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] leading-relaxed">
          In-app notifications are synchronized in real-time across devices via Cloud Firestore listeners. When running as an Android APK or installed PWA on HTTPS, Firebase Cloud Messaging (FCM) handles background push notifications directly on the lock screen.
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {filterUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              You will receive notices when tasks are assigned, accepted, declined, or completed.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClickItem(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                !item.read
                  ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700/80 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div>
                    <h4 className={`text-sm ${!item.read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {!item.read && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                    New
                  </span>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-xs pl-10 leading-relaxed">
                {item.message}
              </p>

              {item.assignmentId && (
                <div className="pl-10 pt-1">
                  <span className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-1">
                    View Assigned Task <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
