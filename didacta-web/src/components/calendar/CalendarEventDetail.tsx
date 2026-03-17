import { useEffect, useRef } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { getEventColors } from './CalendarEventDot';

interface CalendarEventDetailProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  HOLIDAY: 'Festivo',
  VACATION: 'Vacaciones',
  CTE: 'CTE',
  ADMIN: 'Administrativo',
  SUSPENSION: 'Suspension',
  CUSTOM: 'Personalizado',
};

export default function CalendarEventDetail({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CalendarEventDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const colors = getEventColors(event.eventType);
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const isMultiDay = !isSameDay(start, end);
  const canModify = !event.isFromTemplate || !event.mandatory;

  const dateLabel = isMultiDay
    ? `${format(start, "d 'de' MMMM yyyy", { locale: es })} - ${format(end, "d 'de' MMMM yyyy", { locale: es })}`
    : format(start, "d 'de' MMMM yyyy", { locale: es });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 translate-x-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Detalle del evento</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <h4 className="text-xl font-bold text-gray-900">{event.name}</h4>
          </div>

          {/* Type badge */}
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</span>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${colors.text}`}>
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</span>
            <p className="text-sm text-gray-900 mt-1">{dateLabel}</p>
          </div>

          {/* Affects */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded flex items-center justify-center ${event.affectsClasses ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {event.affectsClasses ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
              </span>
              <span className="text-sm text-gray-700">Afecta clases</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded flex items-center justify-center ${event.affectsStaff ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {event.affectsStaff ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
              </span>
              <span className="text-sm text-gray-700">Afecta personal</span>
            </div>
          </div>

          {/* Notes */}
          {event.notes && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notas</span>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}

          {/* Template indicator */}
          {event.isFromTemplate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Este evento proviene de la plantilla oficial</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canModify && !event.isFromTemplate && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(event)}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
