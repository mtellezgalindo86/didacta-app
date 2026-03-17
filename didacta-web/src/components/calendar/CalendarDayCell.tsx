import { parseISO, startOfWeek, isSameDay, isWeekend } from 'date-fns';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { getEventColors, getEventPriority } from './CalendarEventDot';

interface CalendarDayCellProps {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarDayCell({
  date,
  isToday,
  isCurrentMonth,
  events,
  onDayClick,
  onEventClick,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const weekend = isWeekend(date);

  // Sort events by priority (most important first)
  const sorted = [...events].sort(
    (a, b) => getEventPriority(a.eventType) - getEventPriority(b.eventType)
  );

  const topEvent = sorted.length > 0 ? sorted[0] : null;
  const remaining = sorted.length > 1 ? sorted.length - 1 : 0;

  // Determine cell background and border
  let cellBg = weekend ? 'bg-gray-50' : 'bg-white';
  let borderL = '';

  if (topEvent) {
    const colors = getEventColors(topEvent.eventType);
    cellBg = colors.cellBg;
    borderL = colors.borderL;
  }

  // For multi-day events, only show name on first day visible in that week
  let showEventName = false;
  if (topEvent) {
    const eventStart = parseISO(topEvent.startDate);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    // Show name if this day IS the event start, or it's the first day of the week within the range
    showEventName = isSameDay(date, eventStart) || isSameDay(date, weekStart);
  }

  const opacityClass = !isCurrentMonth ? 'opacity-30' : '';

  return (
    <button
      onClick={() => {
        if (topEvent) {
          onEventClick(topEvent);
        } else {
          onDayClick(date);
        }
      }}
      className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-100 text-left transition-colors hover:brightness-95 flex flex-col ${cellBg} ${borderL} ${opacityClass}`}
    >
      {/* Day number */}
      <div className="flex justify-start mb-1">
        <span
          className={`text-sm font-medium inline-flex items-center justify-center ${
            isToday
              ? 'bg-blue-600 text-white rounded-full w-7 h-7'
              : isCurrentMonth
                ? 'text-gray-900 w-7 h-7'
                : 'text-gray-400 w-7 h-7'
          }`}
        >
          {dayNumber}
        </span>
      </div>

      {/* Event label */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        {topEvent && showEventName && (
          <span
            className={`text-xs truncate font-medium ${getEventColors(topEvent.eventType).text}`}
            title={topEvent.name}
          >
            {topEvent.name}
          </span>
        )}
        {remaining > 0 && (
          <span className="text-xs text-gray-500 font-medium">+{remaining}</span>
        )}
      </div>
    </button>
  );
}
