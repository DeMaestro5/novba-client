import { BadgeProps as BadgePropsType } from '@/types/ui.types';

/**
 * Badge – Small status indicator for tags, labels, and status displays.
 * Use for invoice status (Draft, Sent, Paid, Overdue), payment tags, priority, categories.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className = '',
}: BadgePropsType) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';
  const baseStyles = 'inline-flex items-center font-medium';
  const badgeClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return <span className={badgeClasses}>{children}</span>;
}
