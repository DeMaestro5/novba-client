'use client';

import { TextareaProps } from '@/types/ui.types';
import { useEffect, useRef } from 'react';

export default function TextArea({
  label,
  error,
  helperText,
  fullWidth = false,
  showCharCount = false,
  maxLength,
  autoResize = true,
  minRows = 3,
  maxRows = 5,
  containerClassName = '',
  disabled,
  resize = 'none',
  className,
  value,
  onChange,
  ...rest
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //Auto resize
  useEffect(() => {
    if (!autoResize || !textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;

    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, autoResize, minRows, maxRows]);

  const charCount = value ? String(value).length : 0;
  const showCounter = showCharCount && maxLength;

  const containerStyles = `
    ${fullWidth ? 'w-full' : 'w-full max-w-sm'}
    ${containerClassName}
  `;

  const baseTextareaStyles = `
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
    disabled:cursor-not-allowed
  `;

  const borderStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200';

  // Resize styles
  // Map resize prop to correct Tailwind classes
  const getResizeClass = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'vertical':
        return 'resize-y';
      case 'horizontal':
        return 'resize-x';
      case 'both':
        return 'resize';
      default:
        return 'resize-none';
    }
  };

  const resizeStyles = getResizeClass();

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

  // Character counter styles
  const counterStyles = `
    mt-1.5
    text-sm
    text-right
    ${charCount > (maxLength || 0) ? 'text-red-600' : 'text-gray-500'}
  `;
  // Combine all textarea styles
  const textareaClasses = `
${baseTextareaStyles}
${borderStyles}
${resizeStyles}
${className}
`
    .trim()
    .replace(/\s+/g, ' ');
  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && <label className={labelStyles}>{label}</label>}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        disabled={disabled}
        className={textareaClasses}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...rest}
      />

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

      {/* Helper text (only show if no error and no counter) */}
      {!error && !showCounter && helperText && (
        <p className={helperStyles}>{helperText}</p>
      )}

      {/* Character counter */}
      {showCounter && (
        <p className={counterStyles}>
          {charCount} / {maxLength}
        </p>
      )}
    </div>
  );
}
