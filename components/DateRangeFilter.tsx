
import React from 'react';
import { CalendarIcon } from './icons/CalendarIcon';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}) => {
  return (
    <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border shadow-sm">
      <CalendarIcon className="w-5 h-5 text-text-light" />
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 focus:ring-primary focus:border-primary outline-none bg-surface-muted"
          title="Start Date"
        />
        <span className="text-text-light text-xs">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1 focus:ring-primary focus:border-primary outline-none bg-surface-muted"
          title="End Date"
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="text-xs text-primary hover:text-primary-focus font-medium ml-1"
        >
          Clear
        </button>
      )}
    </div>
  );
};
