import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import type { CalendarEvent, CalendarEventType, CreateEventPayload } from '../../hooks/useCalendarEvents';
import { ALL_EVENT_TYPES } from '../../components/calendar/CalendarEventDot';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarMonthGrid from '../../components/calendar/CalendarMonthGrid';
import CalendarListView from '../../components/calendar/CalendarListView';
import CalendarEventForm from '../../components/calendar/CalendarEventForm';
import CalendarEventDetail from '../../components/calendar/CalendarEventDetail';

export default function CalendarView() {
  const nav = useCalendarNavigation();
  const cal = useCalendarEvents();

  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CalendarEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<CalendarEventType>>(
    () => new Set(ALL_EVENT_TYPES)
  );

  // On mobile, default to list view
  useEffect(() => {
    if (window.innerWidth < 640) {
      nav.setView('list');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load calendars on mount
  useEffect(() => {
    cal.fetchCalendars().then(calendars => {
      if (calendars.length > 0) {
        setSelectedCalendarId(calendars[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch events when calendar changes
  useEffect(() => {
    if (selectedCalendarId) {
      cal.fetchEvents(selectedCalendarId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendarId]);

  const selectedCalendar = cal.calendars.find(c => c.id === selectedCalendarId);

  // Filter events by active filter types and exclude deleted
  const filteredEvents = useMemo(() => {
    return cal.events.filter(
      e => !e.deleted && activeFilters.has(e.eventType)
    );
  }, [cal.events, activeFilters]);

  const handleToggleFilter = useCallback((type: CalendarEventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setDefaultDate(date);
    setEditingEvent(null);
    setShowForm(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setDetailEvent(event);
    setShowDetail(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setDefaultDate(null);
    setShowForm(true);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setShowDetail(false);
    setEditingEvent(event);
    setShowForm(true);
  }, []);

  const handleDeleteRequest = useCallback((event: CalendarEvent) => {
    setShowDetail(false);
    setDeleteConfirm(event);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm || !selectedCalendarId) return;
    try {
      await cal.deleteEvent(selectedCalendarId, deleteConfirm.id);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, selectedCalendarId, cal]);

  const handleSaveEvent = useCallback(async (payload: CreateEventPayload) => {
    if (!selectedCalendarId) return;
    if (editingEvent) {
      await cal.updateEvent(selectedCalendarId, editingEvent.id, payload);
    } else {
      await cal.createEvent(selectedCalendarId, payload);
    }
  }, [selectedCalendarId, editingEvent, cal]);

  // Loading state
  if (cal.loading && cal.calendars.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-gray-50">
        <p className="text-gray-500">Cargando calendario...</p>
      </div>
    );
  }

  // Error state
  if (cal.error && cal.calendars.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{cal.error}</p>
          <button
            onClick={() => cal.fetchCalendars()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (cal.calendars.length === 0 && !cal.loading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay calendarios</h3>
            <p className="text-gray-500 text-sm">
              Aun no se ha configurado un calendario para esta institucion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario</h1>

        {/* Calendar selector (if multiple) */}
        {cal.calendars.length > 1 && (
          <div className="flex gap-2 mb-4">
            {cal.calendars.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCalendarId(c.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  c.id === selectedCalendarId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Header with filters and legend */}
        <CalendarHeader
          currentDate={nav.currentDate}
          view={nav.view}
          onPrevMonth={nav.goToPrevMonth}
          onNextMonth={nav.goToNextMonth}
          onToday={nav.goToToday}
          onViewChange={nav.setView}
          calendarName={selectedCalendar?.name ?? 'Calendario'}
          onAddEvent={handleAddEvent}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
        />

        {/* Loading overlay for events */}
        {cal.loading && cal.calendars.length > 0 && (
          <div className="flex justify-center py-8">
            <p className="text-gray-500 text-sm">Cargando eventos...</p>
          </div>
        )}

        {/* Calendar views */}
        {!cal.loading && nav.view === 'month' && (
          <CalendarMonthGrid
            currentDate={nav.currentDate}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}

        {!cal.loading && nav.view === 'list' && (
          <CalendarListView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteRequest}
          />
        )}
      </div>

      {/* Event form modal */}
      <CalendarEventForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        event={editingEvent}
        defaultDate={defaultDate}
      />

      {/* Event detail panel */}
      <CalendarEventDetail
        event={detailEvent}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteRequest}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar evento</h3>
            <p className="text-sm text-gray-600 mb-6">
              Estas seguro de que deseas eliminar <strong>{deleteConfirm.name}</strong>? Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
