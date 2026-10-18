import React from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  RefreshCw,
  Smartphone,
  Trash2,
  UserCheck,
  Wrench,
  X
} from 'lucide-react';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../../services/notificationService';
import { Assignment, NotificationItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectAssignmentById: (assignmentId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectAssignmentById
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(notifications);
  };

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.read) {
      await markNotificationAsRead(item.id);
    }
    if (item.assignmentId) {
      onSelectAssignmentById(item.assignmentId);
      onClose();
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              In-App Notification Center
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">{unreadCount} unread notices</span>
            <button
              onClick={handleMarkAllRead}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>
        )}

        {/* FCM Push Notification Info Banner */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Push & Mobile Notification Readiness</span>
          </div>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
            In-app notifications are live via Firestore. When packaged as a PWA / Android app with HTTPS, Firebase Cloud Messaging (FCM) delivers lock-screen push alerts.
          </p>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                  !item.read
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/80 shadow-2xs'
                    : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(item.type)}
                    <h4 className={`font-semibold ${!item.read ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.title}
                    </h4>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-[11px] pl-6 leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pl-6 pt-1 text-[10px] text-slate-400">
                  <span>{formatDateTime(item.createdAt)}</span>
                  {item.assignmentId && (
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      View Task <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
