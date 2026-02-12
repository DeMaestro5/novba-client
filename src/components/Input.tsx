import { InputProps } from '@/types/ui.types';

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  containerClassName = '',
  className = '',
  disabled,
  type = 'text',
  ...rest
}: InputProps) {
  const containerStyles = `${fullWidth ? 'w-full' : 'w-full max-w-sm'}
  ${containerClassName}
  `;
  const baseInputStyles = `
   w-full
    px-4
    py-2.5
    text-base
    text-gray-900
    bg-white
    border-2
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    disabled:bg-gray-50
    disabled:text-gray-500
    disabled:cursor-not-allowed`;
  const borderStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200';
  const iconPaddingStyles = `
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
  `;
  const labelStyles = `
  block
  text-sm
  font-medium
  text-gray-700
  mb-1.5
`;
  const errorStyles = `
mt-1.5
text-sm
text-red-600
flex
items-center
gap-1
`;
  const helperStyles = `
mt-1.5
text-sm
text-gray-500
`;
  const iconStyles = `
    absolute
    top-1/2
    -translate-y-1/2
    flex
    items-center
    justify-center
    text-gray-400
    pointer-events-none
  `;

  const leftIconStyles = `${iconStyles} left-3`;
  const rightIconStyles = `${iconStyles} right-3`;

  // Combine all input styles
  const inputClasses = `
    ${baseInputStyles}
    ${borderStyles}
    ${iconPaddingStyles}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && <label className={labelStyles}>{label}</label>}

      {/* Input wrapper - RELATIVE positioning (creates context) */}
      <div className='relative'>
        {/* Left icon - ABSOLUTE positioning */}
        {leftIcon && <div className={leftIconStyles}>{leftIcon}</div>}

        {/* Input field */}
        <input
          type={type}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        />

        {/* Right icon - ABSOLUTE positioning */}
        {rightIcon && <div className={rightIconStyles}>{rightIcon}</div>}
      </div>

      {/* Error message */}
      {error && (
        <p className={errorStyles}>
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text (only show if no error) */}
      {!error && helperText && <p className={helperStyles}>{helperText}</p>}
    </div>
  );
}
