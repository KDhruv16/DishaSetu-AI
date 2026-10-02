import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Shared Viewport-Safe Modal Component
 * 
 * Renders into document.body via React Portal to ensure:
 * 1. Overlay spans the complete browser viewport (inset: 0, 100vw x 100vh).
 * 2. Background page, including sticky headers and sidebars, is fully dimmed from y = 0.
 * 3. Modal is horizontally centered and starts at a clean top offset (~24-32px).
 * 4. Content scrolls internally with max-h-[calc(100vh-64px)].
 * 5. Traps scroll on body when open, preventing background layout shift.
 * 6. Supports ESC key to close and click-outside backdrop close.
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-3xl',
  className = '',
  overlayClassName = '',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-8 box-border bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn ${overlayClassName}`}
      onClick={closeOnBackdrop && onClose ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-3xl ${maxWidth} w-full mx-auto my-0 shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-6 max-h-[calc(100vh-64px)] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
