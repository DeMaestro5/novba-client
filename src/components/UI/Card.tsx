'use client';

import {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from '@/types/ui.types';

/**
 * Card – Container for grouping related content with optional header and footer.
 * Use for invoice cards, dashboard stats, client info, settings sections.
 */
export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
  ...rest
}: CardProps) {
  const baseStyles = `
    bg-white
    border-2
    border-gray-200
    rounded-lg
    shadow-sm
    transition-all
    duration-200
  `;
  const hoverStyles = hover
    ? `hover:shadow-md hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`
    : '';
  const cardClasses = `${baseStyles} ${hoverStyles} ${className}`
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} onClick={onClick} role={onClick ? 'button' : undefined} {...rest}>
      {children}
    </div>
  );
}

/**
 * CardHeader – Title, optional subtitle, and optional right-side action.
 */
export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  const headerStyles = `
    border-b
    border-gray-200
    flex
    justify-between
    items-center
    p-4
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return (
    <div className={headerStyles}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * CardBody – Main content area with configurable padding.
 */
export function CardBody({
  children,
  className = '',
  padding = 'md',
}: CardBodyProps) {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  const bodyClasses = `${paddingStyles[padding]} ${className}`
    .trim()
    .replace(/\s+/g, ' ');
  return <div className={bodyClasses}>{children}</div>;
}

/**
 * CardFooter – Footer area with optional top divider.
 */
export function CardFooter({
  children,
  className = '',
  divider = false,
}: CardFooterProps) {
  const footerStyles = `
    ${divider ? 'border-t border-gray-100' : ''}
    p-4
    flex
    items-center
    gap-2
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return <div className={footerStyles}>{children}</div>;
}

