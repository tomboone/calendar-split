/**
 * Google Calendar API utilities
 */

import {
  GoogleCalendarEvent,
  CalendarEvent,
  GoogleCalendarListResponse,
} from '../types/calendar';
import { CalendarSource } from '../config/calendar.config';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch events from a single calendar
 */
export async function fetchCalendarEvents(
  calendarId: string,
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication expired. Please sign in again.');
    }
    if (response.status === 403) {
      throw new Error(`Access denied to calendar: ${calendarId}`);
    }
    if (response.status === 404) {
      throw new Error(`Calendar not found: ${calendarId}`);
    }
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(`Failed to fetch calendar: ${response.statusText}`);
  }

  const data: GoogleCalendarListResponse = await response.json();
  return data.items || [];
}

/**
 * Convert Google Calendar event to our internal format
 */
export function convertEvent(
  event: GoogleCalendarEvent,
  calendarSource: CalendarSource,
  defaultColor: string
): CalendarEvent | null {
  // Skip cancelled events
  if (event.status === 'cancelled') {
    return null;
  }

  const isAllDay = !event.start.dateTime;

  let start: Date;
  let end: Date;

  if (isAllDay) {
    // All-day events use date strings (YYYY-MM-DD)
    start = new Date(event.start.date + 'T00:00:00');
    end = new Date(event.end.date + 'T00:00:00');
  } else {
    start = new Date(event.start.dateTime!);
    end = new Date(event.end.dateTime!);
  }

  // Determine if event is tentative
  const isTentative = isTentativeEvent(event);

  return {
    id: event.id,
    title: event.summary || '(No title)',
    description: event.description,
    location: event.location,
    start,
    end,
    isAllDay,
    isTentative,
    calendarId: calendarSource.id,
    calendarName: calendarSource.name,
    color: calendarSource.color || defaultColor,
    originalEvent: event,
  };
}

/**
 * Check if an event is tentative
 */
function isTentativeEvent(event: GoogleCalendarEvent): boolean {
  // Check status
  if (event.status === 'tentative') {
    return true;
  }

  // Check user's response status
  const selfAttendee = event.attendees?.find((a) => a.self);
  if (selfAttendee?.responseStatus === 'tentative') {
    return true;
  }

  // Check title for tentative keywords
  const title = event.summary?.toLowerCase() || '';
  const tentativeKeywords = ['maybe', 'tentative', 'possibly', 'perhaps', '?'];
  if (tentativeKeywords.some((keyword) => title.includes(keyword))) {
    return true;
  }

  return false;
}

/**
 * Fetch and convert events from multiple calendars
 */
export async function fetchColumnEvents(
  calendars: CalendarSource[],
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  defaultColors: string[]
): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];

  const promises = calendars.map(async (calendar, index) => {
    try {
      const events = await fetchCalendarEvents(
        calendar.id,
        accessToken,
        timeMin,
        timeMax
      );

      const defaultColor = defaultColors[index % defaultColors.length];

      return events
        .map((event) => convertEvent(event, calendar, defaultColor))
        .filter((event): event is CalendarEvent => event !== null);
    } catch (error) {
      console.error(`Error fetching calendar ${calendar.id}:`, error);
      // Re-throw authentication errors so they can be handled at a higher level
      if (error instanceof Error && error.message.includes('Authentication expired')) {
        throw error;
      }
      // Return empty array for other failed calendars to allow others to succeed
      return [];
    }
  });

  const results = await Promise.all(promises);
  results.forEach((events) => allEvents.push(...events));

  // Sort by start time
  allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

  return allEvents;
}

/**
 * Check if an event overlaps with a given time range
 */
export function eventOverlapsRange(
  event: CalendarEvent,
  start: Date,
  end: Date
): boolean {
  return event.start < end && event.end > start;
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => eventOverlapsRange(event, dayStart, dayEnd));
}

/**
 * Calculate event position in the time grid
 * Returns top position and height as percentages
 */
export function calculateEventPosition(
  event: CalendarEvent,
  dayStart: Date,
  startHour: number,
  endHour: number
): { top: number; height: number; startsBeforeView: boolean; endsAfterView: boolean } {
  const viewStartTime = new Date(dayStart);
  viewStartTime.setHours(startHour, 0, 0, 0);

  const viewEndTime = new Date(dayStart);
  viewEndTime.setHours(endHour, 0, 0, 0);

  const totalMinutes = (endHour - startHour) * 60;

  // Clamp event times to view boundaries
  const effectiveStart = event.start < viewStartTime ? viewStartTime : event.start;
  const effectiveEnd = event.end > viewEndTime ? viewEndTime : event.end;

  const startsBeforeView = event.start < viewStartTime;
  const endsAfterView = event.end > viewEndTime;

  const startMinutes =
    (effectiveStart.getHours() - startHour) * 60 + effectiveStart.getMinutes();
  const endMinutes =
    (effectiveEnd.getHours() - startHour) * 60 + effectiveEnd.getMinutes();

  const top = (startMinutes / totalMinutes) * 100;
  const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

  return {
    top: Math.max(0, top),
    height: Math.max(0, Math.min(100 - top, height)),
    startsBeforeView,
    endsAfterView,
  };
}

/**
 * Group overlapping events for side-by-side display
 */
export function groupOverlappingEvents(
  events: CalendarEvent[]
): CalendarEvent[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [];
  let currentGroupEnd: Date | null = null;

  for (const event of sorted) {
    if (currentGroupEnd === null || event.start >= currentGroupEnd) {
      // Start new group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [event];
      currentGroupEnd = event.end;
    } else {
      // Add to current group
      currentGroup.push(event);
      if (event.end > currentGroupEnd) {
        currentGroupEnd = event.end;
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
