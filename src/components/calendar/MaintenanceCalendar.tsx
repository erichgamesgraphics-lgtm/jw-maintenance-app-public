import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Sparkles,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, Category } from '../../types';
import { formatDate } from '../../utils/formatters';

interface MaintenanceCalendarProps {
  assignments: Assignment[];
  categories: Category[];
  onSelectAssignment: (assignment: Assignment) => void;
  onOpenRecurring: () => void;
}

type CalendarView = 'agenda' | 'month';

export const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  assignments,
  categories,
  onSelectAssignment,
  onOpenRecurring
}) => {
  const { isCoordinator } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  // Mobile Agenda by default as required
  const [view, setView] = useState<CalendarView>('agenda');

  // Month navigation
  const prevPeriod = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextPeriod = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = () => setCurrentDate(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map assignments by date
  const assignmentsByDate: Record<string, Assignment[]> = {};
  assignments.forEach((a) => {
    const targetDate = a.scheduledDate || a.deadline;
    if (targetDate) {
      if (!assignmentsByDate[targetDate]) {
        assignmentsByDate[targetDate] = [];
      }
      assignmentsByDate[targetDate].push(a);
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Agenda list (all upcoming tasks sorted by date)
  const upcomingAgenda = [...assignments]
    .filter(a => a.status !== 'cancelled' && a.status !== 'reviewed')
    .sort((a, b) => {
      const dateA = a.scheduledDate || a.deadline;
      const dateB = b.scheduledDate || b.deadline;
      return dateA.localeCompare(dateB);
    });

  return (
    <div className="space-y-3.5">
      {/* Calendar Header with View Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {monthNames[month]} {year}
              </h2>
              <p className="text-[10px] text-slate-400">Maintenance schedule</p>
            </div>
          </div>

          {/* View Toggles */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setView('agenda')}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                view === 'agenda' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Agenda
            </button>
            <button
              onClick={() => setView('month')}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                view === 'month' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Month
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={today}
            className="min-h-[36px] px-3 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            Today
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevPeriod}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isCoordinator && (
            <button
              onClick={onOpenRecurring}
              className="min-h-[36px] px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Recurring
            </button>
          )}
        </div>
      </div>

      {/* Default View: Phone-Friendly Agenda List */}
      {view === 'agenda' && (
        <div className="space-y-2">
          {upcomingAgenda.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No scheduled maintenance upcoming.
            </div>
          ) : (
            upcomingAgenda.map((item) => {
              const targetDate = item.scheduledDate || item.deadline;
              const isScheduled = !!item.scheduledDate;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAssignment(item)}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-400 cursor-pointer transition-all flex items-center gap-3 select-none"
                >
                  {/* Date badge */}
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-blue-600 leading-none">
                      {formatDate(targetDate).slice(0, 3)}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {new Date(targetDate).getDate() || 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                        {isScheduled ? item.scheduledTime || 'Scheduled' : 'Due'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-1 truncate">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Assigned: {Object.values(item.assignedUserNames || {}).join(', ') || 'Unassigned'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Optional Compact Month Grid */}
      {view === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 text-center py-1.5 text-[11px] font-bold text-slate-400">
            {weekDayNames.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Compact days */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 bg-slate-50/30 dark:bg-slate-950/20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayAssignments = assignmentsByDate[dateString] || [];
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (dayAssignments.length > 0) {
                      onSelectAssignment(dayAssignments[0]);
                    }
                  }}
                  className={`h-12 p-1 flex flex-col justify-between items-center transition-colors cursor-pointer ${
                    isToday ? 'bg-blue-50/50 dark:bg-blue-950/30 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[11px] w-5 h-5 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {dayNum}
                  </span>

                  {dayAssignments.length > 0 && (
                    <div className="flex gap-0.5 mt-auto">
                      {dayAssignments.slice(0, 3).map((_, idx) => (
                        <span key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
