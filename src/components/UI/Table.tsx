'use client';

import {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from '@/types/ui.types';

/**
 * Table – Clean, modern data table with striped rows and hover states.
 * Use for invoices, clients, transactions, and any tabular data.
 */
export default function Table({ children, className = '' }: TableProps) {
  const tableClasses = `
    w-full
    border
    border-gray-200
    rounded-lg
    overflow-hidden
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className='overflow-x-auto'>
      <table className={tableClasses}>{children}</table>
    </div>
  );
}

/**
 * TableHeader – Header section with gray background and uppercase labels.
 */
export function TableHeader({ children, className = '' }: TableHeaderProps) {
  const headerClasses = `
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return <thead className={headerClasses}>{children}</thead>;
}

/**
 * TableBody – Body section containing data rows with alternating strip styling.
 */
export function TableBody({ children, className = '' }: TableBodyProps) {
  const bodyClasses = `
    [&>tr:nth-child(odd)]:bg-white
    [&>tr:nth-child(even)]:bg-gray-50/50
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return <tbody className={bodyClasses}>{children}</tbody>;
}

/**
 * TableRow – Single row. Supports click handler and alternating row styling.
 */
export function TableRow({ children, className = '', onClick }: TableRowProps) {
  const rowClasses = `
    transition-colors
    duration-150
    ${onClick ? 'cursor-pointer' : ''}
    hover:!bg-gray-50
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <tr
      className={rowClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </tr>
  );
}

/**
 * TableHead – Header cell with typography styling.
 */
export function TableHead({ children, className = '' }: TableHeadProps) {
  const headClasses = `
    px-4
    py-3
    text-left
    text-xs
    font-semibold
    text-gray-600
    uppercase
    tracking-wide
    bg-gray-50
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return <th className={headClasses}>{children}</th>;
}

/**
 * TableCell – Data cell with consistent padding.
 */
export function TableCell({ children, className = '' }: TableCellProps) {
  const cellClasses = `
    px-4
    py-3
    text-sm
    text-gray-900
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return <td className={cellClasses}>{children}</td>;
}
