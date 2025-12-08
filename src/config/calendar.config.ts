/**
 * Calendar Split Configuration
 *
 * This file contains the base configuration and type definitions.
 *
 * To configure your calendars:
 * 1. Copy calendars.local.example.ts to calendars.local.ts
 * 2. Edit calendars.local.ts with your calendar IDs
 * 3. The .local.ts file is gitignored and won't be committed
 *
 * Alternatively, set VITE_CALENDAR_CONFIG environment variable with JSON config.
 */

export interface CalendarSource {
  /** The Google Calendar ID (usually an email address or calendar-specific ID) */
  id: string;
  /** Display name for this calendar (optional, for color coding) */
  name?: string;
  /** Custom color for events from this calendar (CSS color value) */
  color?: string;
}

export interface ColumnConfig {
  /** Display name shown at the top of the column */
  name: string;
  /** List of calendar IDs to aggregate in this column */
  calendars: CalendarSource[];
}

export interface AppConfig {
  /**
   * Google OAuth 2.0 Client ID
   * Get this from: https://console.cloud.google.com/apis/credentials
   */
  googleClientId: string;

  /**
   * Column definitions - each column represents a person or group
   * All calendars within a column are aggregated together
   */
  columns: ColumnConfig[];

  /**
   * Display settings
   */
  display: {
    /** Start hour for the time grid (0-23) */
    startHour: number;
    /** End hour for the time grid (0-23) */
    endHour: number;
    /** Default view: 'day', 'week', or 'month' */
    defaultView: 'day' | 'week' | 'month';
    /** Time zone for displaying events (IANA timezone, e.g., 'America/New_York') */
    timezone: string;
    /** Whether to show tentative events by default */
    showTentative: boolean;
  };

  /**
   * Default colors for calendars if not specified
   * Colors will be assigned in order for calendars without explicit colors
   */
  defaultColors: string[];
}

/**
 * Default display settings (can be committed to git)
 */
export const defaultDisplaySettings: AppConfig['display'] = {
  startHour: 0,      // 12 AM (midnight)
  endHour: 24,       // 12 AM (next day)
  defaultView: 'day',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect
  showTentative: true,
};

/**
 * Default colors for calendars (can be committed to git)
 */
export const defaultColors: string[] = [
  '#4285f4', // Blue
  '#34a853', // Green
  '#fbbc04', // Yellow
  '#ea4335', // Red
  '#9c27b0', // Purple
  '#ff9800', // Orange
  '#009688', // Teal
  '#e91e63', // Pink
  '#3f51b5', // Indigo
  '#00bcd4', // Cyan
];

/**
 * Example columns shown when no local config exists
 */
const exampleColumns: ColumnConfig[] = [
  {
    name: 'Person 1',
    calendars: [
      {
        id: 'example@gmail.com',
        name: 'Personal',
        color: '#4285f4'
      },
    ],
  },
  {
    name: 'Person 2',
    calendars: [
      {
        id: 'example2@gmail.com',
        name: 'Personal',
        color: '#9c27b0'
      },
    ],
  },
];

/**
 * Load columns from environment variable if available
 * Format: JSON string of ColumnConfig[]
 */
function loadColumnsFromEnv(): ColumnConfig[] | null {
  const envConfig = import.meta.env.VITE_CALENDAR_COLUMNS;
  if (envConfig) {
    try {
      return JSON.parse(envConfig);
    } catch (e) {
      console.error('Failed to parse VITE_CALENDAR_COLUMNS:', e);
    }
  }
  return null;
}

/**
 * Import local config if it exists (injected at build time)
 * This will be undefined if calendars.local.ts doesn't exist
 */
// @ts-ignore - This is conditionally injected by vite.config.ts
const localColumns: ColumnConfig[] | undefined = __LOCAL_CALENDAR_COLUMNS__;

/**
 * Main application configuration
 */
const config: AppConfig = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  columns: localColumns ?? loadColumnsFromEnv() ?? exampleColumns,
  display: defaultDisplaySettings,
  defaultColors,
};

export default config;
