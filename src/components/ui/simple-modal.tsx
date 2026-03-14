import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideBackdrop?: boolean;
}

export function SimpleModal({ isOpen, onClose, children, className = '', hideBackdrop = false }: SimpleModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    isOpen ? (
      <div className={`fixed inset-0 z-50 ${className}`}>
        {/* Backdrop with blur */}
        {!hideBackdrop && (
          <div
            className="absolute inset-0 bg-black/10 cursor-pointer"
            style={{
              backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        
        {/* Modal content */}
        <div className="relative w-full h-full">
          {children}
        </div>
      </div>
    ) : null,
    document.body
  );
}