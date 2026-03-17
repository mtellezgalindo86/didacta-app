import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarViewMode } from '../../hooks/useCalendarNavigation';
import type { CalendarEventType } from '../../hooks/useCalendarEvents';
import { getEventColors, EVENT_TYPE_LABELS, ALL_EVENT_TYPES } from './CalendarEventDot';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewMode;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarViewMode) => void;
  calendarName: string;
  onAddEvent: () => void;
  activeFilters: Set<CalendarEventType>;
  onToggleFilter: (type: CalendarEventType) => void;
}

export default function CalendarHeader({
  currentDate,
  view,
  onPrevMonth,
  onNextMonth,
  onToday,
  onViewChange,
  calendarName,
  onAddEvent,
  activeFilters,
  onToggleFilter,
}: CalendarHeaderProps) {
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: es });
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="mb-6 space-y-4">
      {/* Top row: name, navigation, actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Calendar name */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{calendarName}</h2>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[140px] text-center">
            {capitalizedMonth}
          </span>
        </div>

        {/* Right: View toggle + Add */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => onViewChange('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                view === 'month'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                view === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lista
            </button>
          </div>

          {/* Add event */}
          <button
            onClick={onAddEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span className="hidden sm:inline">Agregar evento</span>
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {ALL_EVENT_TYPES.map(type => {
          const colors = getEventColors(type);
          const isActive = activeFilters.has(type);
          return (
            <button
              key={type}
              onClick={() => onToggleFilter(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                isActive
                  ? `${colors.badgeBg} ${colors.badgeText} border-transparent`
                  : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? colors.dot : 'bg-gray-300'}`} />
              {EVENT_TYPE_LABELS[type]}
              {isActive && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {ALL_EVENT_TYPES.map(type => {
          const colors = getEventColors(type);
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              <span className="text-xs text-gray-600">{EVENT_TYPE_LABELS[type]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
