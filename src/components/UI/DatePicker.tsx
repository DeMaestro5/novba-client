'use client';

import { useState, useEffect, useRef } from 'react';
import { DatePickerProps } from '@/types/ui.types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

function getCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const days: CalendarDay[] = [];

  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevYear, prevMonth, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 6 rows (42 cells)
  const totalCells = 42;
  const remaining = totalCells - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(nextYear, nextMonth, d),
      isCurrentMonth: false,
    });
  }

  return days;
}

/**
 * DatePicker – Text input with calendar dropdown. Select date, clear with X.
 * Matches design system: orange focus, rounded-lg, professional calendar UI.
 */
export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  error,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? value.getMonth() : new Date().getMonth()
  );
  const [viewYear, setViewYear] = useState(() =>
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const CALENDAR_WIDTH = 280;
  const CALENDAR_HEIGHT = 340;

  // Smart dropdown placement: avoid overflow right and bottom
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setAlignRight(rect.left + CALENDAR_WIDTH > window.innerWidth - 16);
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < CALENDAR_HEIGHT);
    }
  }, [isOpen]);

  // Sync view to value when value changes externally
  useEffect(() => {
    if (value) {
      setViewMonth(value.getMonth());
      setViewYear(value.getFullYear());
    }
  }, [value?.getTime()]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const openCalendar = () => {
    if (disabled) return;
    setIsOpen(true);
    if (value) {
      setViewMonth(value.getMonth());
      setViewYear(value.getFullYear());
    } else {
      const now = new Date();
      setViewMonth(now.getMonth());
      setViewYear(now.getFullYear());
    }
  };

  const handleSelectDate = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const displayValue = value ? formatDisplayDate(value) : '';
  const calendarGrid = getCalendarGrid(viewYear, viewMonth);

  const inputContainerClasses = `
    flex
    items-center
    min-w-0
    rounded-lg
    border
    px-4
    py-2.5
    transition-colors
    duration-200
    ${error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500'}
    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white cursor-text'}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const dropdownClasses = `
    absolute
    min-w-[280px]
    w-[280px]
    ${alignRight ? 'right-0' : 'left-0'}
    ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'}
    z-[9999]
    bg-white
    dark:bg-gray-800
    dark:border-gray-700
    rounded-lg
    border
    border-gray-200
    shadow-lg
    p-4
    transition-all
    duration-150
    ${openUpward ? 'origin-bottom' : 'origin-top'}
    ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div ref={containerRef} className='relative w-full'>
      {label && (
        <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
          {label}
        </label>
      )}
      <div
        className={inputContainerClasses}
        onClick={openCalendar}
        role='button'
        tabIndex={disabled ? undefined : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCalendar();
          }
        }}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-label={label || 'Select date'}
      >
        <input
          type='text'
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          className='flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none cursor-pointer'
          aria-label={label || 'Date'}
        />
        <div className='flex items-center gap-1 shrink-0'>
          {value && (
            <button
              type='button'
              onClick={handleClear}
              className='p-0.5 rounded text-gray-400 dark:text-gray-500 dark:hover:text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1'
              aria-label='Clear date'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
          <span className='text-gray-400 dark:text-gray-500' aria-hidden>
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
            </svg>
          </span>
        </div>
      </div>

      <div className={dropdownClasses} role='dialog' aria-modal='true' aria-label='Calendar'>
        <div className='flex items-center justify-between gap-2 mb-4'>
          <button
            type='button'
            onClick={goPrevMonth}
            className='p-1.5 rounded-lg text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500'
            aria-label='Previous month'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
            </svg>
          </button>
          <span className='text-sm font-medium text-gray-900 dark:text-white'>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type='button'
            onClick={goNextMonth}
            className='p-1.5 rounded-lg text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500'
            aria-label='Next month'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
            </svg>
          </button>
        </div>

        <div className='grid grid-cols-7 gap-0.5 mb-2'>
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className='h-8 sm:h-9 flex items-center justify-center text-xs font-medium uppercase text-gray-500'
            >
              {day}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-0.5'>
          {calendarGrid.map(({ date, isCurrentMonth }) => {
            const selected = value ? isSameDay(date, value) : false;
            const today = isToday(date);
            const cellClasses = `
              h-8
              w-8
              sm:h-9
              sm:w-9
              flex
              items-center
              justify-center
              rounded-lg
              text-xs
              sm:text-sm
              cursor-pointer
              transition-colors
              duration-200
              ${selected ? 'bg-orange-600 text-white hover:bg-orange-700' : ''}
              ${!selected && today ? 'border border-orange-300 text-gray-900' : ''}
              ${!selected && !today && isCurrentMonth ? 'text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-100' : ''}
              ${!selected && !isCurrentMonth ? 'text-gray-400 dark:text-gray-600 hover:bg-gray-50' : ''}
            `
              .trim()
              .replace(/\s+/g, ' ');
            return (
              <button
                key={date.getTime()}
                type='button'
                className={cellClasses}
                onClick={() => handleSelectDate(date)}
                aria-label={formatDisplayDate(date)}
                aria-selected={selected}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className='mt-1.5 text-xs text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
