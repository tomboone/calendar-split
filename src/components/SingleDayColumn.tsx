/**
 * Single Day Column Component - displays one person's events for a single day
 */

import { useMemo, RefObject } from 'react';
import { ColumnData } from '../types/calendar';
import { CalendarEvent, AllDayEvent } from './CalendarEvent';
import {
  getEventsForDay,
  calculateEventPosition,
  groupOverlappingEvents,
} from '../utils/calendar';
import { formatDate, isToday } from '../utils/date';
import config from '../config/calendar.config';

interface SingleDayColumnProps {
  column: ColumnData;
  date: Date;
  hourHeight: number;
  totalHours: number;
  showDayHeader?: boolean;
  showPersonName?: boolean;
  headerRef?: RefObject<HTMLDivElement>;
}

export function SingleDayColumn({
  column,
  date,
  hourHeight,
  totalHours,
  showDayHeader = true,
  showPersonName = false,
  headerRef,
}: SingleDayColumnProps) {
  const { startHour, endHour } = config.display;
  const gridHeight = totalHours * hourHeight;

  const dayEvents = useMemo(
    () => getEventsForDay(column.events, date),
    [column.events, date]
  );

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
    <div className="flex-1 min-w-[150px] border-r border-gray-200 last:border-r-0 flex flex-col">
      {/* Column header with day info */}
      {showDayHeader && (
        <div
          ref={headerRef}
          className={`
            text-center py-2 border-b border-gray-200 sticky top-0 z-10 flex-shrink-0
            ${isTodayDate ? 'bg-blue-50' : 'bg-white'}
          `}
        >
          {showPersonName && (
            <>
              <div className="font-semibold text-gray-800 truncate px-2">
                {column.name}
              </div>
              {column.error && (
                <div className="text-xs text-red-500 truncate px-1">{column.error}</div>
              )}
              {column.isLoading && (
                <div className="text-xs text-blue-500">Loading...</div>
              )}
            </>
          )}
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
      )}

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="px-1 py-1 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {allDayEvents.map((event) => (
            <AllDayEvent key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="relative" style={{ height: gridHeight }}>
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: i * hourHeight }}
          />
        ))}

        {/* Current time indicator */}
        {isTodayDate && (
          <CurrentTimeIndicator
            startHour={startHour}
            endHour={endHour}
            gridHeight={gridHeight}
          />
        )}

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

interface CurrentTimeIndicatorProps {
  startHour: number;
  endHour: number;
  gridHeight: number;
}

function CurrentTimeIndicator({ startHour, endHour, gridHeight }: CurrentTimeIndicatorProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if current time is within view
  if (currentHour < startHour || currentHour >= endHour) {
    return null;
  }

  const totalMinutes = (endHour - startHour) * 60;
  const currentMinutes = (currentHour - startHour) * 60 + currentMinute;
  const topPx = (currentMinutes / totalMinutes) * gridHeight;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: topPx }}
    >
      <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5" />
      <div className="flex-1 h-0.5 bg-red-500" />
    </div>
  );
}
