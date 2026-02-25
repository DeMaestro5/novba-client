import { ButtonProps } from '@/types/ui.types';

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const baseStyles = `inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden`;
  const variantStyles = {
    primary: `bg-orange-600 text-white hover:bg-orange-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-orange-500 active:translate-y-0 disabled:bg-orange-300 disabled:shadow-none disabled:translate-y-0`,
    secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-gray-400 active:translate-y-0 disabled:bg-gray-50 disabled:shadow-none disabled:translate-y-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:bg-gray-900`,
    outline: `bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-gray-400 active:translate-y-0 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none disabled:translate-y dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:disabled:bg-gray-900 dark:disabled:text-gray-600`,
    danger: `
    bg-red-600
    text-white
    shadow-sm
    hover:bg-red-700
    hover:shadow-md
    hover:-translate-y-0.5
    focus-visible:ring-red-500
    active:translate-y-0
    disabled:bg-red-300
    disabled:shadow-none
    disabled:translate-y-0
  `,
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const widthStyles = fullWidth ? 'w-full' : '';
  const loadingStyles = isLoading ? 'cursor-wait' : '';
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${loadingStyles}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {/*Loading Spinner */}
      {isLoading && (
        <svg
          className='animate-spin -ml-1 mr-2 h-4 w-4'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      )}
      {children}
    </button>
  );
}
