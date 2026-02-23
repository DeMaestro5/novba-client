'use client';

import { PaginationProps } from '@/types/ui.types';
import Button from './Button';

/**
 * Generates page number array with ellipsis for large page counts.
 * Max 7 elements: first, ellipsis?, current-1, current, current+1, ellipsis?, last.
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('ellipsis');
  }

  const start = showLeftEllipsis ? Math.max(2, currentPage - 1) : 2;
  const end = showRightEllipsis
    ? Math.min(totalPages - 1, currentPage + 1)
    : totalPages - 1;

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination – Page navigation for lists/tables. Prev/Next + optional page numbers.
 * Responsive: hides page numbers on mobile, shows "Page X of Y".
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  className = '',
}: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalPages <= 0;

  const containerClasses = `
    flex
    flex-col
    sm:flex-row
    items-center
    justify-between
    gap-4
    border-t
    border-gray-200
    dark:border-gray-700
    pt-4
    transition-opacity
    duration-200
    ease-in-out
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <nav
      className={containerClasses}
      aria-label="Pagination"
    >
      <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        Page {currentPage} of {Math.max(1, totalPages)}
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          type="button"
          aria-label="Previous page"
        >
          <svg
            className="w-4 h-4 sm:mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only sm:not-sr-only sm:inline">Previous</span>
        </Button>

        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1 mx-1">
            {pageNumbers.map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-400 dark:text-gray-500"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={currentPage === item ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(item)}
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={currentPage === item ? 'page' : undefined}
                >
                  {item}
                </Button>
              )
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          type="button"
          aria-label="Next page"
        >
          <span className="sr-only sm:not-sr-only sm:inline">Next</span>
          <svg
            className="w-4 h-4 sm:ml-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </nav>
  );
}
