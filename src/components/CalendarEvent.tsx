/**
 * Calendar Event Component
 */

import { useRef } from 'react';
import { CalendarEvent as CalendarEventType } from '../types/calendar';
import { formatTime } from '../utils/date';
import { useEventPopup } from '../hooks/useEventPopup';
import config from '../config/calendar.config';

interface CalendarEventProps {
  event: CalendarEventType;
  style: React.CSSProperties;
  isCompact?: boolean;
}

export function CalendarEvent({ event, style, isCompact = false }: CalendarEventProps) {
  const { openPopup } = useEventPopup();
  const elementRef = useRef<HTMLDivElement>(null);
  const startTime = formatTime(event.start, config.display.timezone);
  const endTime = formatTime(event.end, config.display.timezone);

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
        absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-xs overflow-hidden
        border-l-2 cursor-pointer transition-all hover:shadow-md hover:z-10
        ${event.isTentative ? 'opacity-70 border-dashed' : 'opacity-100'}
      `}
      style={{
        ...style,
        backgroundColor: `${event.color}20`,
        borderLeftColor: event.color,
      }}
    >
      <div className="font-medium truncate" style={{ color: event.color }}>
        {event.title}
      </div>
      {!isCompact && (
        <>
          <div className="text-gray-600 text-[10px]">
            {startTime} - {endTime}
          </div>
          {event.isTentative && (
            <div className="text-gray-500 text-[10px] italic">Tentative</div>
          )}
        </>
      )}
    </div>
  );
}

interface AllDayEventProps {
  event: CalendarEventType;
}

export function AllDayEvent({ event }: AllDayEventProps) {
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
        px-1 py-0.5 rounded text-xs truncate mb-0.5
        border-l-2 cursor-pointer transition-all hover:shadow-md
        ${event.isTentative ? 'opacity-70 border-dashed' : 'opacity-100'}
      `}
      style={{
        backgroundColor: `${event.color}20`,
        borderLeftColor: event.color,
        color: event.color,
      }}
    >
      {event.title}
      {event.isTentative && <span className="text-gray-500 ml-1">(tentative)</span>}
    </div>
  );
}
