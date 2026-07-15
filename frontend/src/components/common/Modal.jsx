import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'var(--color-bg-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 'var(--z-modal)',
    padding: 'var(--space-4)',
  },
  content: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-6)',
    borderBottom: '1px solid var(--color-border)',
  },
  body: {
    padding: 'var(--space-6)',
  },
};

const SIZES = {
  sm: 480,
  md: 520,
  lg: 720,
  xl: 900,
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div style={modalStyles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...modalStyles.content, maxWidth: SIZES[size] || SIZES.md }} role="dialog" aria-modal="true" aria-label={title}>
        <div style={modalStyles.header}>
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div style={modalStyles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
