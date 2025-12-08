/**
 * Day Column Component - displays a single day's events
 */

import { useMemo } from 'react';
import { CalendarEvent as CalendarEventType } from '../types/calendar';
import { CalendarEvent, AllDayEvent } from './CalendarEvent';
import {
  getEventsForDay,
  calculateEventPosition,
  groupOverlappingEvents,
} from '../utils/calendar';
import { formatDate, isToday } from '../utils/date';
import config from '../config/calendar.config';

interface DayColumnProps {
  date: Date;
  events: CalendarEventType[];
  showTimeLabels?: boolean;
}

export function DayColumn({ date, events, showTimeLabels = false }: DayColumnProps) {
  const { startHour, endHour } = config.display;
  const totalHours = endHour - startHour;
  const hourHeight = 48; // pixels per hour

  const dayEvents = useMemo(() => getEventsForDay(events, date), [events, date]);

  const allDayEvents = useMemo(
    () => dayEvents.filter((e) => e.isAllDay),
    [dayEvents]
  );

  const timedEvents = useMemo(
    () => dayEvents.filter((e) => !e.isAllDay),
    [dayEvents]
  );

  const eventGroups = useMemo(
    () => groupOverlappingEvents(timedEvents),
    [timedEvents]
  );

  const isTodayDate = isToday(date);

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Day header */}
      <div
        className={`
          text-center py-2 border-b border-gray-200 sticky top-0 bg-white z-10
          ${isTodayDate ? 'bg-blue-50' : ''}
        `}
      >
        <div className="text-xs text-gray-500 uppercase">
          {formatDate(date, 'EEE')}
        </div>
        <div
          className={`
            text-lg font-semibold
            ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}
          `}
        >
          {formatDate(date, 'd')}
        </div>
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="px-1 py-1 border-b border-gray-200 bg-gray-50 min-h-[32px]">
          {allDayEvents.map((event) => (
            <AllDayEvent key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Time grid */}
      <div
        className="relative flex-1"
        style={{ height: totalHours * hourHeight }}
      >
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }, (_, i) => {
          const hour = (i + startHour) % 24;
          const label = hour === 0 ? '12 AM'
            : hour === 12 ? '12 PM'
            : hour > 12 ? `${hour - 12} PM`
            : `${hour} AM`;

          return (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: i * hourHeight }}
            >
              {showTimeLabels && (
                <span className="absolute -left-14 -top-2 text-xs text-gray-400 w-12 text-right">
                  {label}
                </span>
              )}
            </div>
          );
        })}

        {/* Current time indicator */}
        {isTodayDate && <CurrentTimeIndicator />}

        {/* Events */}
        {eventGroups.flatMap((group, groupIndex) =>
          group.map((event, eventIndex) => {
            const position = calculateEventPosition(
              event,
              date,
              startHour,
              endHour
            );
            const width = (100 / group.length) - 1;
            const left = eventIndex * (100 / group.length);

            return (
              <CalendarEvent
                key={`${groupIndex}-${event.id}`}
                event={event}
                style={{
                  top: `${position.top}%`,
                  height: `${Math.max(position.height, 2)}%`,
                  left: `calc(${left}% + 2px)`,
                  width: `calc(${width}% - 2px)`,
                }}
                isCompact={position.height < 5}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function CurrentTimeIndicator() {
  const { startHour, endHour } = config.display;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour < startHour || currentHour >= endHour) {
    return null;
  }

  const totalMinutes = (endHour - startHour) * 60;
  const currentMinutes = (currentHour - startHour) * 60 + currentMinute;
  const top = (currentMinutes / totalMinutes) * 100;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}%` }}
    >
      <div className="relative">
        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
        <div className="h-0.5 bg-red-500" />
      </div>
    </div>
  );
}
