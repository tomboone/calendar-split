/**
 * Date utility functions
 */

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  format,
  isToday,
  isSameDay,
  getDay,
  eachDayOfInterval,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { DateRange, ViewMode } from '../types/calendar';

/**
 * Get date range for the current view
 */
export function getDateRange(date: Date, viewMode: ViewMode): DateRange {
  if (viewMode === 'day') {
    // Single day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    return { start: dayStart, end: dayEnd };
  } else if (viewMode === 'week') {
    // Week starts on Sunday
    return {
      start: startOfWeek(date, { weekStartsOn: 0 }),
      end: endOfWeek(date, { weekStartsOn: 0 }),
    };
  } else {
    // Month view - get the full month
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Extend to full weeks for display
    return {
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
  }
}

/**
 * Navigate to previous period
 */
export function getPreviousPeriod(date: Date, viewMode: ViewMode): Date {
  if (viewMode === 'day') {
    return addDays(date, -1);
  } else if (viewMode === 'week') {
    return addWeeks(date, -1);
  }
  return addMonths(date, -1);
}

/**
 * Navigate to next period
 */
export function getNextPeriod(date: Date, viewMode: ViewMode): Date {
  if (viewMode === 'day') {
    return addDays(date, 1);
  } else if (viewMode === 'week') {
    return addWeeks(date, 1);
  }
  return addMonths(date, 1);
}

/**
 * Get all days in a date range
 */
export function getDaysInRange(range: DateRange): Date[] {
  return eachDayOfInterval({ start: range.start, end: range.end });
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string, timezone?: string): string {
  if (timezone) {
    return formatInTimeZone(date, timezone, formatStr);
  }
  return format(date, formatStr);
}

/**
 * Format time for display
 */
export function formatTime(date: Date, timezone?: string): string {
  const formatStr = 'h:mm a';
  if (timezone) {
    return formatInTimeZone(date, timezone, formatStr);
  }
  return format(date, formatStr);
}

/**
 * Get the header label for the current view
 */
export function getViewHeaderLabel(date: Date, viewMode: ViewMode): string {
  if (viewMode === 'day') {
    return format(date, 'EEEE, MMMM d, yyyy');
  } else if (viewMode === 'week') {
    const range = getDateRange(date, 'week');
    const startMonth = format(range.start, 'MMM');
    const endMonth = format(range.end, 'MMM');
    const year = format(range.end, 'yyyy');

    if (startMonth === endMonth) {
      return `${startMonth} ${format(range.start, 'd')} - ${format(range.end, 'd')}, ${year}`;
    }
    return `${startMonth} ${format(range.start, 'd')} - ${endMonth} ${format(range.end, 'd')}, ${year}`;
  }
  return format(date, 'MMMM yyyy');
}

/**
 * Check if a date is today
 */
export { isToday, isSameDay };

/**
 * Get day of week (0 = Sunday)
 */
export { getDay };

/**
 * Add days to a date
 */
export { addDays };

/**
 * Generate hour labels for the time grid
 */
export function getHourLabels(startHour: number, endHour: number): string[] {
  const labels: string[] = [];
  for (let i = startHour; i <= endHour; i++) {
    const hour = i % 24;
    const label = hour === 0 ? '12 AM'
      : hour === 12 ? '12 PM'
      : hour > 12 ? `${hour - 12} PM`
      : `${hour} AM`;
    labels.push(label);
  }
  return labels;
}

/**
 * Get current time position as percentage within the day view
 */
export function getCurrentTimePosition(startHour: number, endHour: number): number | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if current time is within view
  if (currentHour < startHour || currentHour >= endHour) {
    return null;
  }

  const totalMinutes = (endHour - startHour) * 60;
  const currentMinutes = (currentHour - startHour) * 60 + currentMinute;

  return (currentMinutes / totalMinutes) * 100;
}

/**
 * Convert a date to the specified timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}
