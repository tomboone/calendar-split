/**
 * Person Column Component - displays a person's weekly calendar
 */

import { ColumnData } from '../types/calendar';
import { DateRange } from '../types/calendar';
import { DayColumn } from './DayColumn';
import { getDaysInRange, getHourLabels } from '../utils/date';
import config from '../config/calendar.config';

interface PersonColumnProps {
  column: ColumnData;
  dateRange: DateRange;
  isFirst: boolean;
}

export function PersonColumn({ column, dateRange, isFirst }: PersonColumnProps) {
  const days = getDaysInRange(dateRange);
  const { startHour, endHour } = config.display;
  const hourLabels = getHourLabels(startHour, endHour);

  return (
    <div className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0">
      {/* Person header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <h2 className="font-semibold text-gray-800 text-center truncate">
          {column.name}
        </h2>
        {column.error && (
          <p className="text-xs text-red-500 text-center mt-1 truncate">
            {column.error}
          </p>
        )}
        {column.isLoading && (
          <p className="text-xs text-blue-500 text-center mt-1">Loading...</p>
        )}
      </div>

      {/* Week view */}
      <div className="flex overflow-x-auto">
        {/* Time labels column - only show for first person */}
        {isFirst && (
          <div className="w-14 flex-shrink-0 border-r border-gray-200">
            <div className="h-[52px] border-b border-gray-200" /> {/* Header space */}
            <div className="relative" style={{ height: (endHour - startHour) * 48 }}>
              {hourLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute text-xs text-gray-400 text-right pr-2 w-full"
                  style={{ top: index * 48 - 6 }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Days */}
        <div className="flex flex-1">
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              events={column.events}
              showTimeLabels={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
