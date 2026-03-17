import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { getEventColors, EVENT_TYPE_LABELS } from './CalendarEventDot';

interface CalendarListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400 flex-shrink-0"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EventTypeIcon({ eventType }: { eventType: string }) {
  const iconClass = 'flex-shrink-0';
  switch (eventType) {
    case 'HOLIDAY':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      );
    case 'VACATION':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      );
    case 'CTE':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      );
    case 'SUSPENSION':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      );
    case 'ADMIN':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      );
  }
}

export default function CalendarListView({
  events,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
}: CalendarListViewProps) {
  // Filter deleted events
  const activeEvents = events.filter(e => !e.deleted);

  // Sort by start date ascending
  const sorted = [...activeEvents].sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
  );

  // Group by month
  const groups: Record<string, CalendarEvent[]> = {};
  for (const event of sorted) {
    const key = format(parseISO(event.startDate), 'yyyy-MM');
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No hay eventos en este calendario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([monthKey, monthEvents]) => {
        const monthDate = parseISO(`${monthKey}-01`);
        const monthLabel = format(monthDate, 'MMMM yyyy', { locale: es });
        const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

        return (
          <div key={monthKey}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {capitalizedMonth}
              </h3>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{monthEvents.length} evento{monthEvents.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {monthEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                  onEdit={() => onEditEvent(event)}
                  onDelete={() => onDeleteEvent(event)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({
  event,
  onClick,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = getEventColors(event.eventType);
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const isMultiDay = !isSameDay(start, end);

  const dateLabel = isMultiDay
    ? `${format(start, 'd MMM yyyy', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`
    : format(start, 'd MMM yyyy', { locale: es });

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      {/* Color bar */}
      <div className={`w-1 h-12 rounded-full flex-shrink-0 ${colors.dot}`} />

      {/* Icon */}
      <div className={`flex-shrink-0 ${colors.text}`}>
        <EventTypeIcon eventType={event.eventType} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900 truncate">{event.name}</span>
          {event.isFromTemplate && <LockIcon />}
        </div>
        <span className="text-xs text-gray-500">{dateLabel}</span>
      </div>

      {/* Type badge */}
      <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${colors.badgeBg} ${colors.badgeText}`}>
        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {event.isFromTemplate ? (
          <span className="p-1.5 text-gray-400" title="Evento de plantilla">
            <LockIcon />
          </span>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
