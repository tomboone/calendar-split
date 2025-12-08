/**
 * Week View Component - displays side-by-side columns for each person with a shared week
 */

import { useRef, useEffect, useState } from 'react';
import { ColumnData, DateRange } from '../types/calendar';
import { SingleDayColumn } from './SingleDayColumn';
import { getDaysInRange, isToday } from '../utils/date';
import config from '../config/calendar.config';

interface WeekViewProps {
  columns: ColumnData[];
  dateRange: DateRange;
}

export function WeekView({ columns, dateRange }: WeekViewProps) {
  const { startHour, endHour } = config.display;
  const totalHours = endHour - startHour;
  const hourHeight = 48; // pixels per hour
  const gridHeight = totalHours * hourHeight;
  const days = getDaysInRange(dateRange);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeColumnRef = useRef<HTMLDivElement>(null);
  const personHeaderRef = useRef<HTMLDivElement>(null);
  const dayHeaderRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);

  // Check if any day in the range is today
  const hasToday = days.some(day => isToday(day));

  // Measure combined header height (person header + day header)
  useEffect(() => {
    const measureHeader = () => {
      const personHeight = personHeaderRef.current?.offsetHeight || 0;
      const dayHeight = dayHeaderRef.current?.offsetHeight || 0;
      setHeaderHeight(personHeight + dayHeight);
    };

    measureHeader();
    window.addEventListener('resize', measureHeader);
    return () => window.removeEventListener('resize', measureHeader);
  }, [columns, dateRange]);

  // Sync scroll between time column and main content
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const timeColumn = timeColumnRef.current;

    if (!scrollContainer || !timeColumn) return;

    const handleScroll = () => {
      timeColumn.scrollTop = scrollContainer.scrollTop;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart initial scroll position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || hasScrolledInitially || headerHeight === 0) return;

    const viewportHeight = scrollContainer.clientHeight;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Calculate current time position in pixels
    const currentTimePosition = ((currentHour - startHour) * 60 + currentMinute) / 60 * hourHeight;

    // Calculate where 8am would be
    const eightAmPosition = (8 - startHour) * hourHeight;

    // Determine scroll position
    let targetScroll: number;

    if (hasToday && currentHour >= startHour && currentHour < endHour) {
      // Today is in view and current time is within range - try to center it
      const idealScroll = currentTimePosition - (viewportHeight / 2);
      const maxScroll = gridHeight - viewportHeight;
      targetScroll = Math.max(0, Math.min(idealScroll, maxScroll));
    } else {
      // Current time is outside view range or today not in view - scroll to 8am
      const idealScroll = eightAmPosition - 50;
      const maxScroll = gridHeight - viewportHeight;
      targetScroll = Math.max(0, Math.min(idealScroll, maxScroll));
    }

    scrollContainer.scrollTop = targetScroll;
    setHasScrolledInitially(true);
  }, [headerHeight, hasScrolledInitially, startHour, endHour, hourHeight, gridHeight, hasToday]);

  // Reset scroll flag when date range changes
  useEffect(() => {
    setHasScrolledInitially(false);
  }, [dateRange]);

  // Generate hour labels
  const hourLabels: string[] = [];
  for (let i = 0; i <= totalHours; i++) {
    const hour = (startHour + i) % 24;
    const label = hour === 0 ? '12 AM'
      : hour === 12 ? '12 PM'
      : hour > 12 ? `${hour - 12} PM`
      : `${hour} AM`;
    hourLabels.push(label);
  }

  return (
    <div className="flex h-full">
      {/* Time labels column - fixed */}
      <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Header spacer - dynamically matches column headers */}
        <div
          className="border-b border-gray-200 flex-shrink-0"
          style={{ height: headerHeight > 0 ? headerHeight : 'auto', minHeight: 88 }}
        />
        {/* Scrollable time labels */}
        <div
          ref={timeColumnRef}
          className="flex-1 overflow-hidden"
        >
          <div className="relative" style={{ height: gridHeight }}>
            {hourLabels.map((label, index) => (
              <div
                key={index}
                className="absolute right-2 text-xs text-gray-500"
                style={{ top: index * hourHeight - 6 }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main scrollable area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
      >
        <div className="flex min-w-full">
          {/* Each person column */}
          {columns.map((column, columnIndex) => (
            <div
              key={column.name}
              className="flex-1 min-w-[200px] border-r border-gray-300 last:border-r-0 flex flex-col"
            >
              {/* Person header */}
              <div
                ref={columnIndex === 0 ? personHeaderRef : undefined}
                className="bg-gray-100 border-b border-gray-200 px-2 py-2 sticky top-0 z-20 text-center flex-shrink-0"
              >
                <h2 className="font-semibold text-gray-800 truncate">
                  {column.name}
                </h2>
                {column.error && (
                  <p className="text-xs text-red-500 truncate mt-1">
                    {column.error}
                  </p>
                )}
                {column.isLoading && (
                  <p className="text-xs text-blue-500 mt-1">Loading...</p>
                )}
              </div>

              {/* Days row for this person */}
              <div className="flex flex-1">
                {days.map((day, dayIndex) => (
                  <SingleDayColumn
                    key={day.toISOString()}
                    column={column}
                    date={day}
                    hourHeight={hourHeight}
                    totalHours={totalHours}
                    showDayHeader={true}
                    headerRef={columnIndex === 0 && dayIndex === 0 ? dayHeaderRef : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
