'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { DropdownMenuProps, DropdownMenuItemProps } from '@/types/ui.types';

const DropdownMenuContext = createContext<{ close: () => void } | null>(null);

/**
 * DropdownMenu – Click-to-open dropdown with positioned menu and click-outside-to-close.
 * Use for row actions (View, Edit, Delete), context menus, and action lists.
 */
export default function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className = '',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = align === 'right' ? 'right-0' : 'left-0';
  const originStyles =
    align === 'right' ? 'origin-top-right' : 'origin-top-left';

  const menuClasses = `
    absolute
    ${alignStyles}
    top-full
    mt-2
    z-50
    min-w-[180px]
    rounded-lg
    border
    border-gray-200
    bg-white
    shadow-lg
    py-1
    transition-all
    duration-150
    ${originStyles}
    ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <DropdownMenuContext.Provider value={{ close }}>
      <div ref={containerRef} className='relative inline-block'>
        <div onClick={toggleOpen} className='cursor-pointer'>
          {trigger}
        </div>
        <div className={menuClasses} role='menu'>
          {children}
        </div>
      </div>
    </DropdownMenuContext.Provider>
  );
}

/**
 * DropdownMenuItem – Single menu item with optional icon and variant styling.
 */
export function DropdownMenuItem({
  children,
  onClick,
  icon,
  variant = 'default',
  className = '',
}: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);

  const variantStyles = {
    default: 'text-gray-700 hover:bg-gray-50',
    danger: 'text-red-600 hover:bg-red-50',
  };

  const itemClasses = `
    flex
    items-center
    gap-3
    w-full
    px-4
    py-2.5
    text-sm
    text-left
    transition-colors
    duration-150
    cursor-pointer
    ${variantStyles[variant]}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const handleClick = () => {
    onClick?.();
    context?.close();
  };

  return (
    <div className={itemClasses} onClick={handleClick} role='menuitem'>
      {icon && (
        <span className='shrink-0 text-current [&>svg]:w-4 [&>svg]:h-4'>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}

/**
 * DropdownMenuDivider – Visual separator between menu item groups.
 */
export function DropdownMenuDivider() {
  return <div className='my-1 border-t border-gray-100' role='separator' />;
}
