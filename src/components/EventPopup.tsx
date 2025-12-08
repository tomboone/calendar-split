/**
 * Event Detail Popup Component
 */

import { useEffect, useRef } from 'react';
import { CalendarEvent as CalendarEventType } from '../types/calendar';
import { formatTime, formatDate } from '../utils/date';
import config from '../config/calendar.config';

interface EventPopupProps {
  event: CalendarEventType;
  anchorRect: DOMRect;
  onClose: () => void;
}

export function EventPopup({ event, anchorRect, onClose }: EventPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const startTime = formatTime(event.start, config.display.timezone);
  const endTime = formatTime(event.end, config.display.timezone);
  const startDate = formatDate(event.start, 'EEEE, MMMM d, yyyy');
  const endDate = formatDate(event.end, 'EEEE, MMMM d, yyyy');
  const isSameDay = formatDate(event.start, 'yyyy-MM-dd') === formatDate(event.end, 'yyyy-MM-dd');

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Calculate popup position
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = 320;
  const popupHeight = 300; // Approximate max height

  let left = anchorRect.right + 8;
  let top = anchorRect.top;

  // If popup would overflow right edge, show on left side
  if (left + popupWidth > viewportWidth - 16) {
    left = anchorRect.left - popupWidth - 8;
  }

  // If still overflowing, center horizontally
  if (left < 16) {
    left = Math.max(16, (viewportWidth - popupWidth) / 2);
  }

  // If popup would overflow bottom, adjust top
  if (top + popupHeight > viewportHeight - 16) {
    top = Math.max(16, viewportHeight - popupHeight - 16);
  }

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
      <div
        ref={popupRef}
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] overflow-auto"
        style={{
          left,
          top,
          pointerEvents: 'auto',
        }}
      >
        {/* Header with color */}
        <div
          className="px-4 py-3 rounded-t-lg"
          style={{ backgroundColor: `${event.color}15` }}
        >
          <div className="flex items-start justify-between">
            <h3
              className="font-semibold text-lg pr-2"
              style={{ color: event.color }}
            >
              {event.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {event.calendarName && (
            <div className="text-sm text-gray-600 mt-1">
              {event.calendarName}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-3">
          {/* Time */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              {event.isAllDay ? (
                <div>
                  <div className="font-medium">All day</div>
                  <div className="text-gray-600">
                    {isSameDay ? startDate : `${startDate} - ${endDate}`}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">{startTime} - {endTime}</div>
                  <div className="text-gray-600">{startDate}</div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-sm text-gray-700">{event.location}</div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <div
                className="text-sm text-gray-700 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: linkifyText(event.description),
                }}
              />
            </div>
          )}

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {event.isTentative && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Tentative
              </span>
            )}
          </div>

          {/* Open in Google Calendar */}
          {event.originalEvent.htmlLink && (
            <div className="pt-2 border-t border-gray-100">
              <a
                href={event.originalEvent.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                Open in Google Calendar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Convert URLs in text to clickable links
 */
function linkifyText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
}
