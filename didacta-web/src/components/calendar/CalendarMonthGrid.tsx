import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import CalendarDayCell from './CalendarDayCell';

interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter(event => {
    const start = parseISO(event.startDate);
    const end = parseISO(event.endDate);
    return isWithinInterval(day, { start, end });
  });
}

export default function CalendarMonthGrid({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: CalendarMonthGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter out deleted events
  const activeEvents = events.filter(e => !e.deleted);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-opacity duration-200">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAY_LABELS.map(label => (
          <div
            key={label}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dayEvents = getEventsForDay(activeEvents, day);
          return (
            <CalendarDayCell
              key={day.toISOString()}
              date={day}
              isToday={isToday(day)}
              isCurrentMonth={isSameMonth(day, currentDate)}
              events={dayEvents}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
}
