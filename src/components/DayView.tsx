/**
 * Day View Component - displays a single day for all people side-by-side
 */

import { useRef, useEffect, useState } from 'react';
import { ColumnData } from '../types/calendar';
import { SingleDayColumn } from './SingleDayColumn';
import config from '../config/calendar.config';

interface DayViewProps {
  columns: ColumnData[];
  currentDate: Date;
}

export function DayView({ columns, currentDate }: DayViewProps) {
  const { startHour, endHour } = config.display;
  const totalHours = endHour - startHour;
  const hourHeight = 48; // pixels per hour
  const gridHeight = totalHours * hourHeight;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeColumnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);

  // Measure header height from the first column
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    measureHeader();
    // Re-measure on window resize
    window.addEventListener('resize', measureHeader);
    return () => window.removeEventListener('resize', measureHeader);
  }, [columns, currentDate]);

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

    if (currentHour >= startHour && currentHour < endHour) {
      // Current time is within view range - try to center it
      const idealScroll = currentTimePosition - (viewportHeight / 2);

      // Clamp to valid scroll range
      const maxScroll = gridHeight - viewportHeight;
      targetScroll = Math.max(0, Math.min(idealScroll, maxScroll));
    } else {
      // Current time is outside view range - scroll to 8am or start
      const idealScroll = eightAmPosition - 50; // A bit of padding above 8am
      const maxScroll = gridHeight - viewportHeight;
      targetScroll = Math.max(0, Math.min(idealScroll, maxScroll));
    }

    scrollContainer.scrollTop = targetScroll;
    setHasScrolledInitially(true);
  }, [headerHeight, hasScrolledInitially, startHour, endHour, hourHeight, gridHeight]);

  // Reset scroll flag when date changes
  useEffect(() => {
    setHasScrolledInitially(false);
  }, [currentDate]);

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
          style={{ height: headerHeight > 0 ? headerHeight : 'auto', minHeight: 52 }}
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
          {columns.map((column, index) => (
            <SingleDayColumn
              key={column.name}
              column={column}
              date={currentDate}
              hourHeight={hourHeight}
              totalHours={totalHours}
              showPersonName={true}
              headerRef={index === 0 ? headerRef : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
