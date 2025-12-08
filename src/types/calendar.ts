/**
 * Type definitions for Google Calendar API responses and app state
 */

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  transparency?: 'opaque' | 'transparent';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    self?: boolean;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  htmlLink?: string;
  colorId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  isTentative: boolean;
  calendarId: string;
  calendarName?: string;
  color: string;
  originalEvent: GoogleCalendarEvent;
}

export interface ColumnData {
  name: string;
  events: CalendarEvent[];
  isLoading: boolean;
  error?: string;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  accessToken?: string;
}

export interface CalendarState {
  columns: ColumnData[];
  viewMode: ViewMode;
  currentDate: Date;
  dateRange: DateRange;
  showTentative: boolean;
  isRefreshing: boolean;
}

// Google API types
export interface GapiTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}
