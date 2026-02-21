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
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    openUp: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedMenuHeight = 200;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUp =
        spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      setMenuPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 4,
        left: align === 'right' ? rect.right : rect.left,
        openUp,
      });
    }
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const toggleOpen = () => {
    if (isOpen) close();
    else handleOpen();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => setIsOpen(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ close }}>
      <div ref={containerRef} className="relative inline-block">
        <div
          ref={triggerRef}
          onClick={toggleOpen}
          className="cursor-pointer relative inline-block"
        >
          {trigger}
        </div>
        {isOpen && (
          <div
            role="menu"
            className={`rounded-lg border border-gray-200 bg-white py-1 shadow-lg min-w-[180px] ${className}`}
            style={{
              position: 'fixed',
              top: menuPosition.openUp ? 'auto' : menuPosition.top,
              bottom: menuPosition.openUp
                ? typeof window !== 'undefined'
                  ? `${window.innerHeight - menuPosition.top}px`
                  : 'auto'
                : 'auto',
              left: align === 'right' ? 'auto' : menuPosition.left,
              right:
                align === 'right' && typeof window !== 'undefined'
                  ? `${window.innerWidth - menuPosition.left}px`
                  : 'auto',
              zIndex: 9999,
            }}
          >
            {children}
          </div>
        )}
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
