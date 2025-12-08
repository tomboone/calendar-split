/**
 * Calendar data fetching and state management hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchColumnEvents } from '../utils/calendar';
import { getDateRange, getPreviousPeriod, getNextPeriod } from '../utils/date';
import { ColumnData, ViewMode, DateRange } from '../types/calendar';
import config from '../config/calendar.config';

interface UseCalendarProps {
  accessToken: string | undefined;
  isAuthenticated: boolean;
  onTokenExpired?: () => void;
}

interface UseCalendarReturn {
  columns: ColumnData[];
  viewMode: ViewMode;
  currentDate: Date;
  dateRange: DateRange;
  showTentative: boolean;
  isRefreshing: boolean;
  setViewMode: (mode: ViewMode) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  toggleTentative: () => void;
  refresh: () => void;
}

export function useCalendar({
  accessToken,
  isAuthenticated,
  onTokenExpired,
}: UseCalendarProps): UseCalendarReturn {
  const [columns, setColumns] = useState<ColumnData[]>(() =>
    config.columns.map((col) => ({
      name: col.name,
      events: [],
      isLoading: false,
      error: undefined,
    }))
  );

  const [viewMode, setViewMode] = useState<ViewMode>(config.display.defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showTentative, setShowTentative] = useState<boolean>(
    config.display.showTentative
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const dateRange = useMemo(
    () => getDateRange(currentDate, viewMode),
    [currentDate, viewMode]
  );

  const fetchAllCalendars = useCallback(
    async (isRefresh = false) => {
      if (!accessToken || !isAuthenticated) {
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        // Set loading state for all columns
        setColumns((prev) =>
          prev.map((col) => ({ ...col, isLoading: true, error: undefined }))
        );
      }

      // Extend the fetch range slightly to catch events that span boundaries
      const fetchStart = new Date(dateRange.start);
      fetchStart.setDate(fetchStart.getDate() - 1);
      const fetchEnd = new Date(dateRange.end);
      fetchEnd.setDate(fetchEnd.getDate() + 1);

      // Fetch each column's data
      const promises = config.columns.map(async (columnConfig, index) => {
        try {
          const events = await fetchColumnEvents(
            columnConfig.calendars,
            accessToken,
            fetchStart,
            fetchEnd,
            config.defaultColors
          );

          return {
            name: columnConfig.name,
            events,
            isLoading: false,
            error: undefined,
          };
        } catch (error) {
          console.error(`Error fetching column ${columnConfig.name}:`, error);
          return {
            name: columnConfig.name,
            events: columns[index]?.events || [], // Keep existing events on error
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Failed to fetch calendar',
          };
        }
      });

      const results = await Promise.all(promises);

      // Check if any result has an authentication error
      const hasAuthError = results.some(
        (r) => r.error?.includes('Authentication expired') || r.error?.includes('sign in again')
      );

      if (hasAuthError && onTokenExpired) {
        onTokenExpired();
        return;
      }

      setColumns(results);
      setIsRefreshing(false);
    },
    [accessToken, isAuthenticated, dateRange, columns, onTokenExpired]
  );

  // Fetch data when auth or date range changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchAllCalendars();
    }
  }, [isAuthenticated, accessToken, dateRange.start.getTime(), dateRange.end.getTime()]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchAllCalendars(true); // Silent refresh
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, accessToken, fetchAllCalendars]);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => getPreviousPeriod(prev, viewMode));
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => getNextPeriod(prev, viewMode));
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const toggleTentative = useCallback(() => {
    setShowTentative((prev) => !prev);
  }, []);

  const refresh = useCallback(() => {
    fetchAllCalendars(true);
  }, [fetchAllCalendars]);

  // Filter events based on tentative setting
  const filteredColumns = useMemo(() => {
    if (showTentative) {
      return columns;
    }

    return columns.map((column) => ({
      ...column,
      events: column.events.filter((event) => !event.isTentative),
    }));
  }, [columns, showTentative]);

  return {
    columns: filteredColumns,
    viewMode,
    currentDate,
    dateRange,
    showTentative,
    isRefreshing,
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    toggleTentative,
    refresh,
  };
}
