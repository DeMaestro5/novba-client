'use client';

import { forwardRef } from 'react';

export interface TableActionsTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Optional extra class names (e.g. for opacity-0 group-hover:opacity-100) */
  className?: string;
}

/**
 * TableActionsTrigger – Consistent 3-dots (vertical ellipsis) button for table action dropdowns.
 * Use as the trigger for DropdownMenu in any table's Actions column.
 * Same size and styling across Projects, Invoices, Clients, Proposals, Contracts, Expenses, Payments, Portfolio.
 */
const TableActionsTrigger = forwardRef<HTMLButtonElement, TableActionsTriggerProps>(
  ({ className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Actions"
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
          text-gray-500 transition-colors
          hover:bg-gray-100 hover:text-gray-700
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
          dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300
          dark:focus:ring-offset-gray-900
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...rest}
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    );
  }
);

TableActionsTrigger.displayName = 'TableActionsTrigger';

export default TableActionsTrigger;
