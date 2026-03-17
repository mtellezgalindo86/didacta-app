import { useState, useCallback } from 'react';
import { addMonths, subMonths, startOfToday } from 'date-fns';

export type CalendarViewMode = 'month' | 'list';

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [view, setView] = useState<CalendarViewMode>('month');

  const goToPrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(startOfToday());
  }, []);

  return {
    currentDate,
    view,
    setView,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  };
}
