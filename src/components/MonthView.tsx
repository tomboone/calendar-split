/**
 * Month View Component - displays a monthly calendar grid for each person
 */

import { useRef } from 'react';
import { ColumnData, DateRange, CalendarEvent as CalendarEventType } from '../types/calendar';
import { getDaysInRange, isToday, formatDate } from '../utils/date';
import { getEventsForDay } from '../utils/calendar';
import { useEventPopup } from '../hooks/useEventPopup';

interface MonthViewProps {
  columns: ColumnData[];
  dateRange: DateRange;
  currentDate: Date;
}

export function MonthView({ columns, dateRange, currentDate }: MonthViewProps) {
  const days = getDaysInRange(dateRange);
  const weeks: Date[][] = [];

  // Group days into weeks
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {columns.map((column) => (
        <MonthColumnView
          key={column.name}
          column={column}
          weeks={weeks}
          currentDate={currentDate}
        />
      ))}
    </div>
  );
}

interface MonthColumnViewProps {
  column: ColumnData;
  weeks: Date[][];
  currentDate: Date;
}

function MonthColumnView({ column, weeks, currentDate }: MonthColumnViewProps) {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0 flex flex-col">
      {/* Person header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <h2 className="font-semibold text-gray-800 text-center truncate">
          {column.name}
        </h2>
        {column.error && (
          <p className="text-xs text-red-500 text-center mt-1 truncate">
            {column.error}
          </p>
        )}
        {column.isLoading && (
          <p className="text-xs text-blue-500 text-center mt-1">Loading...</p>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center py-2 text-xs font-medium text-gray-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-100">
            {week.map((day) => (
              <MonthDayCell
                key={day.toISOString()}
                date={day}
                events={column.events}
                currentMonth={currentDate.getMonth()}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MonthDayCellProps {
  date: Date;
  events: CalendarEventType[];
  currentMonth: number;
}

function MonthDayCell({ date, events, currentMonth }: MonthDayCellProps) {
  const dayEvents = getEventsForDay(events, date);
  const isCurrentMonth = date.getMonth() === currentMonth;
  const isTodayDate = isToday(date);

  // Limit displayed events
  const maxEvents = 3;
  const displayedEvents = dayEvents.slice(0, maxEvents);
  const remainingCount = dayEvents.length - maxEvents;

  return (
    <div
      className={`
        min-h-[100px] p-1 border-r border-gray-100 last:border-r-0
        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
      `}
    >
      {/* Day number */}
      <div
        className={`
          w-6 h-6 flex items-center justify-center text-sm mb-1 rounded-full
          ${isTodayDate ? 'bg-blue-600 text-white font-semibold' : ''}
          ${!isCurrentMonth && !isTodayDate ? 'text-gray-400' : 'text-gray-700'}
        `}
      >
        {formatDate(date, 'd')}
      </div>

      {/* Events */}
      <div className="space-y-0.5">
        {displayedEvents.map((event) => (
          <MonthEventItem key={event.id} event={event} />
        ))}
        {remainingCount > 0 && (
          <div className="text-[10px] text-gray-500 px-1">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
}

interface MonthEventItemProps {
  event: CalendarEventType;
}

function MonthEventItem({ event }: MonthEventItemProps) {
  const { openPopup } = useEventPopup();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (elementRef.current) {
      openPopup(event, elementRef.current.getBoundingClientRect());
    }
  };

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      className={`
        text-[10px] px-1 py-0.5 rounded truncate cursor-pointer
        hover:shadow-md transition-all
        ${event.isTentative ? 'opacity-70' : ''}
      `}
      style={{
        backgroundColor: `${event.color}20`,
        color: event.color,
      }}
    >
      {event.isAllDay ? (
        event.title
      ) : (
        <>
          <span className="font-medium">
            {formatDate(event.start, 'h:mm')}
          </span>{' '}
          {event.title}
        </>
      )}
    </div>
  );
}
