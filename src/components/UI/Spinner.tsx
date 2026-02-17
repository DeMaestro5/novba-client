import { SpinnerProps as SpinnerPropsType } from '@/types/ui.types';

/**
 * Spinner – Loading indicator for async operations.
 * Use for button loading, page loading, data fetching, form submissions.
 */
export default function Spinner({
  size = 'md',
  color = 'orange',
  className = '',
  fullScreen = false,
  label = 'Loading...',
}: SpinnerPropsType) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-[3px]',
  };
  const colorStyles = {
    orange: 'border-orange-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };
  const spinnerClasses = `
    rounded-full
    animate-spin
    ${sizeStyles[size]}
    ${colorStyles[color]}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  const spinnerEl = (
    <div
      className={spinnerClasses}
      role="status"
      aria-label={label}
    />
  );
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        role="status"
        aria-label={label}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={spinnerClasses} aria-hidden />
          {label && (
            <p className="text-sm font-medium text-gray-600">{label}</p>
          )}
        </div>
      </div>
    );
  }
  return spinnerEl;
}
