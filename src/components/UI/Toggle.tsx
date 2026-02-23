'use client';

import { useRef } from 'react';
import { ToggleProps } from '@/types/ui.types';

/**
 * Toggle – iOS/macOS style switch. Optional label and description.
 * Keyboard accessible (Space to toggle), smooth animations, design system colors.
 */
export default function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
}: ToggleProps) {
  const inputRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const ariaLabel = label || (description ? undefined : 'Toggle');
  const ariaDescribedBy = description ? 'toggle-description' : undefined;

  const wrapperClasses = `
    flex
    items-center
    justify-between
    gap-3
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const switchTrackClasses = `
    relative
    inline-flex
    items-center
    h-6
    w-11
    shrink-0
    rounded-full
    transition-colors
    duration-200
    ease-in-out
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-orange-500
    focus-visible:ring-offset-2
    cursor-pointer
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${checked ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700'}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const switchThumbClasses = `
    pointer-events-none
    inline-block
    h-5
    w-5
    rounded-full
    bg-white
    shadow-sm
    ring-0
    transition-transform
    duration-200
    ease-in-out
    ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const switchElement = (
    <button
      ref={inputRef}
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={switchTrackClasses}
    >
      <span className={switchThumbClasses} />
    </button>
  );

  if (label || description) {
    return (
      <div className={wrapperClasses}>
        <div className='flex-1 min-w-0'>
          {label && (
            <label
              className='text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer'
              onClick={() => !disabled && inputRef.current?.click()}
            >
              {label}
            </label>
          )}
          {description && (
            <p id='toggle-description' className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              {description}
            </p>
          )}
        </div>
        {switchElement}
      </div>
    );
  }

  return switchElement;
}
