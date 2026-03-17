import { useState, useCallback } from 'react';
import api from '../api/didactaApi';

export type CalendarEventType = 'HOLIDAY' | 'VACATION' | 'CTE' | 'ADMIN' | 'SUSPENSION' | 'CUSTOM';

export interface CalendarEvent {
  id: string;
  calendarId: string;
  name: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  affectsClasses: boolean;
  affectsStaff: boolean;
  notes: string | null;
  isFromTemplate: boolean;
  mandatory: boolean;
  deleted: boolean;
}

export interface CalendarData {
  id: string;
  name: string;
  status: string;
  sectionId: string;
}

export interface CreateEventPayload {
  name: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  affectsClasses: boolean;
  affectsStaff: boolean;
  notes?: string;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<CalendarData[]>('/api/calendars');
      setCalendars(res.data);
      return res.data;
    } catch (err) {
      setError('Error al cargar calendarios');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async (calendarId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ calendar: CalendarData; events: CalendarEvent[] }>(`/api/calendars/${calendarId}`);
      setEvents(res.data.events ?? []);
    } catch (err) {
      setError('Error al cargar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (calendarId: string, payload: CreateEventPayload) => {
    const res = await api.post<CalendarEvent>(`/api/calendars/${calendarId}/events`, payload);
    setEvents(prev => [...prev, res.data]);
    return res.data;
  }, []);

  const updateEvent = useCallback(async (calendarId: string, eventId: string, payload: CreateEventPayload) => {
    const res = await api.patch<CalendarEvent>(`/api/calendars/${calendarId}/events/${eventId}`, payload);
    setEvents(prev => prev.map(e => e.id === eventId ? res.data : e));
    return res.data;
  }, []);

  const deleteEvent = useCallback(async (calendarId: string, eventId: string) => {
    await api.delete(`/api/calendars/${calendarId}/events/${eventId}`);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  return {
    events,
    calendars,
    loading,
    error,
    fetchCalendars,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
