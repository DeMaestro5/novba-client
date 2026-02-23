import { EmptyStateProps } from '@/types/ui.types';
import Button from './Button';

function DefaultEmptyIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

/**
 * EmptyState – Centered empty state for no data scenarios (no invoices, no clients, no search results).
 * Optional icon, title, description, and primary/secondary action buttons.
 */
export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const containerClasses = `
    flex
    flex-col
    items-center
    justify-center
    text-center
    py-12
    px-6
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const iconWrapperClasses = `
    w-16
    h-16
    mx-auto
    mb-4
    rounded-full
    bg-gray-100
    dark:bg-gray-800
    flex
    items-center
    justify-center
    transition-colors
    duration-200
    ease-in-out
  `
    .trim()
    .replace(/\s+/g, ' ');

  const hasActions = primaryAction || secondaryAction;

  return (
    <div className={containerClasses}>
      <div className={iconWrapperClasses}>
        {icon ?? (
          <DefaultEmptyIcon className="text-gray-400 w-8 h-8 shrink-0" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">{description}</p>
      {hasActions && (
        <div className="flex items-center gap-3 justify-center">
          {primaryAction && (
            <Button
              variant="primary"
              onClick={primaryAction.onClick}
              type="button"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              type="button"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
