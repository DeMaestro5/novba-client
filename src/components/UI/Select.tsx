'use client';
import { SelectOption, SelectProps } from '@/types/ui.types';
import { useState, useRef, useEffect } from 'react';

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  searchable = false,
  fullWidth = false,
  containerClassName,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value || '');
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        // TODO: Navigate to next option (we'll keep it simple for now)
        break;
      case 'ArrowUp':
        event.preventDefault();
        // TODO: Navigate to previous option
        break;
    }
  };

  // Container styles
  const containerStyles = `
    ${fullWidth ? 'w-full' : 'w-full max-w-sm'}
    ${containerClassName}
  `;

  // Label styles (same as Input)
  const labelStyles = `
    block
    text-sm
    font-medium
    text-gray-700
    mb-1.5
  `;

  // Select button styles (the clickable part)
  const selectButtonStyles = `
    w-full
    px-4
    py-2.5
    text-left
    bg-white
    border-2
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    cursor-pointer
    flex
    items-center
    justify-between
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}
    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:border-gray-400'}
  `;

  // Dropdown menu styles - ABSOLUTE POSITIONING + Z-INDEX!
  const dropdownStyles = `
    absolute
    top-full
    left-0
    right-0
    mt-1
    bg-white
    border-2
    border-gray-200
    rounded-lg
    shadow-lg
    max-h-60
    overflow-y-auto
    z-50
  `;

  // Option styles
  const optionStyles = (selected: boolean, disabled?: boolean) => `
    px-4
    py-2.5
    cursor-pointer
    transition-colors
    duration-150
    flex
    items-center
    gap-2
    ${selected ? 'bg-orange-50 text-orange-900' : 'text-gray-900'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
  `;

  // Error message styles
  const errorStyles = `
    mt-1.5
    text-sm
    text-red-600
    flex
    items-center
    gap-1
  `;

  // Helper text styles
  const helperStyles = `
    mt-1.5
    text-sm
    text-gray-500
  `;
  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && <label className={labelStyles}>{label}</label>}

      {/* Select Container - RELATIVE positioning (creates context) */}
      <div ref={selectRef} className='relative'>
        {/* Select Button (clickable area) */}
        <button
          type='button'
          className={selectButtonStyles}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          {/* Selected option or placeholder */}
          <span
            className={`flex items-center gap-2 ${!selectedOption ? 'text-gray-600' : 'text-gray-900'}`}
          >
            {selectedOption?.icon && (
              <span className='shrink-0'>{selectedOption.icon}</span>
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Chevron icon (arrow) */}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {/* Dropdown Menu - ABSOLUTE positioning + Z-INDEX */}
        {isOpen && (
          <div className={dropdownStyles}>
            {/* Search Input (if searchable) */}
            {searchable && (
              <div className='p-2 border-b border-gray-200'>
                <input
                  type='text'
                  className='w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-600 border border-gray-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200'
                  placeholder='Search...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
                />
              </div>
            )}

            {/* Options List */}
            <div>
              {filteredOptions.length === 0 ? (
                <div className='px-4 py-3 text-sm text-gray-600 text-center'>
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={optionStyles(
                      option.value === value,
                      option.disabled,
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    {/* Option icon */}
                    {option.icon && (
                      <span className='shrink-0'>{option.icon}</span>
                    )}

                    {/* Option label and description */}
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>{option.label}</div>
                      {option.description && (
                        <div className='text-xs text-gray-600'>
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* Checkmark for selected option */}
                    {option.value === value && (
                      <svg
                        className='w-5 h-5 text-orange-600 shrink-0'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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

      {/* Helper text */}
      {!error && helperText && <p className={helperStyles}>{helperText}</p>}
    </div>
  );
}
