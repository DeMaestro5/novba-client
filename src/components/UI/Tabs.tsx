'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from '@/types/ui.types';
import Badge from './Badge';

interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs components must be used within a Tabs provider.');
  }
  return ctx;
}

/**
 * Tabs – Horizontal tab navigation with active underline, optional badges, and content panels.
 * Supports both controlled (value + onChange) and uncontrolled (defaultValue) modes.
 */
export default function Tabs({
  defaultValue,
  value,
  onChange,
  children,
  className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const setActiveValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const contextValue: TabsContextValue = {
    activeValue,
    setActiveValue,
  };

  const wrapperClasses = `
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={wrapperClasses}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * TabsList – Container for tab triggers. Border bottom, no background.
 */
export function TabsList({ children, className = '' }: TabsListProps) {
  const listClasses = `
    flex
    items-center
    gap-1
    border-b
    border-gray-200
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={listClasses} role="tablist">
      {children}
    </div>
  );
}

/**
 * TabsTrigger – Single tab button. Optional badge. Active state with orange underline.
 */
export function TabsTrigger({
  value,
  children,
  badge,
  disabled = false,
  className = '',
}: TabsTriggerProps) {
  const { activeValue, setActiveValue } = useTabsContext();
  const isActive = activeValue === value;

  const baseClasses = `
    inline-flex
    items-center
    gap-2
    px-4
    py-2.5
    text-sm
    font-medium
    transition-colors
    duration-200
    ease-in-out
    rounded-t-lg
    border-b-2
    border-transparent
    -mb-px
    focus:outline-none
    focus:ring-2
    focus:ring-orange-500
    focus:ring-offset-2
  `;

  const stateClasses = disabled
    ? 'text-gray-400 cursor-not-allowed opacity-50'
    : isActive
      ? 'text-orange-600 border-orange-600'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

  const triggerClasses = `
    ${baseClasses}
    ${stateClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const handleClick = () => {
    if (disabled) return;
    setActiveValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={triggerClasses}
    >
      <span>{children}</span>
      {badge !== undefined && badge !== '' && (
        <Badge size="sm" variant="default" className="shrink-0">
          {String(badge)}
        </Badge>
      )}
    </button>
  );
}

/**
 * TabsContent – Panel shown when its value matches the active tab.
 */
export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeValue } = useTabsContext();

  if (activeValue !== value) return null;

  const contentClasses = `
    pt-4
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div
      className={contentClasses}
      role="tabpanel"
      aria-hidden={false}
    >
      {children}
    </div>
  );
}
