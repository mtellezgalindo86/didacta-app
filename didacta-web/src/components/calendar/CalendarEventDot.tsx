import type { CalendarEventType } from '../../hooks/useCalendarEvents';

interface CalendarEventDotProps {
  name: string;
  eventType: CalendarEventType;
  onClick: () => void;
}

export interface EventColorConfig {
  dot: string;
  text: string;
  bg: string;
  cellBg: string;
  borderL: string;
  badgeBg: string;
  badgeText: string;
}

const EVENT_COLORS: Record<CalendarEventType, EventColorConfig> = {
  HOLIDAY: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'hover:bg-red-50',
    cellBg: 'bg-red-100',
    borderL: 'border-l-4 border-l-red-500',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  },
  VACATION: {
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    bg: 'hover:bg-blue-50',
    cellBg: 'bg-blue-100',
    borderL: 'border-l-4 border-l-blue-500',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  CTE: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'hover:bg-amber-50',
    cellBg: 'bg-amber-100',
    borderL: 'border-l-4 border-l-amber-500',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  SUSPENSION: {
    dot: 'bg-orange-400',
    text: 'text-orange-700',
    bg: 'hover:bg-orange-50',
    cellBg: 'bg-orange-100',
    borderL: 'border-l-4 border-l-orange-400',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
  ADMIN: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'hover:bg-emerald-50',
    cellBg: 'bg-emerald-50',
    borderL: '',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  CUSTOM: {
    dot: 'bg-purple-500',
    text: 'text-purple-700',
    bg: 'hover:bg-purple-50',
    cellBg: 'bg-purple-50',
    borderL: '',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
  },
};

/** Priority order: lower index = higher priority */
const EVENT_TYPE_PRIORITY: CalendarEventType[] = [
  'HOLIDAY',
  'VACATION',
  'CTE',
  'SUSPENSION',
  'ADMIN',
  'CUSTOM',
];

export function getEventColors(eventType: CalendarEventType): EventColorConfig {
  return EVENT_COLORS[eventType] ?? EVENT_COLORS.CUSTOM;
}

export function getEventPriority(eventType: CalendarEventType): number {
  const idx = EVENT_TYPE_PRIORITY.indexOf(eventType);
  return idx >= 0 ? idx : EVENT_TYPE_PRIORITY.length;
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  HOLIDAY: 'Festivo',
  VACATION: 'Vacaciones',
  CTE: 'CTE',
  SUSPENSION: 'Suspension',
  ADMIN: 'Administrativo',
  CUSTOM: 'Personalizado',
};

export const ALL_EVENT_TYPES: CalendarEventType[] = [
  'HOLIDAY',
  'VACATION',
  'CTE',
  'SUSPENSION',
  'ADMIN',
  'CUSTOM',
];

export default function CalendarEventDot({ name, eventType, onClick }: CalendarEventDotProps) {
  const colors = getEventColors(eventType);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-1 w-full px-1 py-0.5 rounded cursor-pointer transition-colors ${colors.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      <span className={`text-xs truncate ${colors.text}`}>{name}</span>
    </button>
  );
}
