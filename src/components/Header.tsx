/**
 * Header Component - navigation and controls
 */

import { ViewMode } from '../types/calendar';
import { getViewHeaderLabel } from '../utils/date';

interface HeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  showTentative: boolean;
  isRefreshing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleTentative: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function Header({
  currentDate,
  viewMode,
  showTentative,
  isRefreshing,
  onPrevious,
  onNext,
  onToday,
  onViewModeChange,
  onToggleTentative,
  onRefresh,
  onSignOut,
}: HeaderProps) {
  const headerLabel = getViewHeaderLabel(currentDate, viewMode);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left side - Title and navigation */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Calendar Split
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Today
            </button>

            <div className="flex items-center">
              <button
                onClick={onPrevious}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={onNext}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Next"
              >
                <ChevronRightIcon />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 min-w-[200px]">
              {headerLabel}
            </h2>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => onViewModeChange('day')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>

          {/* Tentative toggle */}
          <button
            onClick={onToggleTentative}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              showTentative
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title={showTentative ? 'Hide tentative events' : 'Show tentative events'}
          >
            {showTentative ? 'Tentative: On' : 'Tentative: Off'}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh calendars"
          >
            <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
