'use client';

import {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from '@/types/ui.types';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Modal – Overlay dialog for confirmations, forms, and important information.
 * Use for delete confirmation, create/edit forms, invoice preview, notifications.
 * Traps focus, closes on Escape, optional overlay click to close.
 */
export default function Modal({
  isOpen,
  onClose,
  size = 'md',
  children,
  closeOnOverlayClick = true,
  className: contentClassName,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Focus trap: focus first focusable inside modal when opened
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    const focusable = contentRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!closeOnOverlayClick) return;
    if (e.target === e.currentTarget) onClose();
  };

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* Content */}
      <div
        ref={contentRef}
        className={`
          relative
          w-full
          max-h-[90vh]
          transition-all
          duration-200
          ${sizeStyles[size]}
          ${contentClassName ?? 'overflow-y-auto rounded-lg border-0 bg-white shadow-xl dark:border dark:border-gray-700 dark:bg-gray-900'}
        `
          .trim()
          .replace(/\s+/g, ' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ModalHeader – Title, optional subtitle, optional close button.
 */
export function ModalHeader({
  title,
  subtitle,
  onClose,
  className = '',
}: ModalHeaderProps) {
  const headerStyles = `
    border-b
    border-gray-200
    dark:border-gray-700
    flex
    justify-between
    items-start
    p-4
    pr-12
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return (
    <div className={headerStyles}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * ModalBody – Main content area.
 */
export function ModalBody({ children, className = '' }: ModalBodyProps) {
  const bodyStyles = `p-4 ${className}`.trim().replace(/\s+/g, ' ');
  return <div className={bodyStyles}>{children}</div>;
}

/**
 * ModalFooter – Actions row with top border.
 */
export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  const footerStyles = `
    border-t
    border-gray-100
    dark:border-gray-700
    flex
    justify-end
    gap-2
    p-4
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');
  return <div className={footerStyles}>{children}</div>;
}
