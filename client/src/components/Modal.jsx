import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { useTheme } from '../theme/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const maxWidths = { sm: '28rem', md: '36rem', lg: '48rem', xl: '64rem' };
  const maxW = maxWidths[size] || maxWidths.md;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(0.75rem, 3vw, 1.5rem)',
      }}
      onClick={onClose}
    >
      {/* Backdrop — frosted glass */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }} />

      {/* Panel — glass card */}
      <div
        className="animate-fadeIn"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxW,
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '1.25rem',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(130%)',
          WebkitBackdropFilter: 'blur(24px) saturate(130%)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient accent line */}
        <div style={{
          height: '2px', flexShrink: 0,
          background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent-secondary), var(--accent), transparent)',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--glass-border)',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          flexShrink: 0,
        }}>
          <h3 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            fontWeight: 700, margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '50px', padding: '0.3rem',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <HiX style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* Body — scrollable with iOS safe area */}
        <div
          className="modal-body"
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: 'clamp(1rem, 2vw, 1.5rem)',
            paddingBottom: `max(clamp(1rem, 2vw, 1.5rem), env(safe-area-inset-bottom))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
