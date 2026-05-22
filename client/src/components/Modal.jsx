import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { useTheme } from '../theme/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useTheme();
  const isAnime = theme?.group === 'anime';

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
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0,
        background: isAnime ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }} />

      {/* Panel */}
      <div
        className="animate-fadeIn"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxW,
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--card-radius)',
          background: 'var(--bg-surface)',
          border: `1px solid ${isAnime ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isAnime
            ? `0 24px 80px rgba(0,0,0,0.6), 0 0 40px var(--anime-glow)`
            : '0 24px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Anime: energy top stripe */}
        {isAnime && (
          <div style={{
            height: '2px', flexShrink: 0,
            background: `linear-gradient(90deg, transparent, var(--accent), var(--energy-color), var(--accent), transparent)`,
            backgroundSize: '200% auto',
            animation: 'energyTextFlow 2.5s linear infinite',
          }} />
        )}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${isAnime ? 'color-mix(in srgb, var(--accent) 30%, var(--border))' : 'var(--border)'}`,
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          flexShrink: 0,
          background: isAnime ? 'color-mix(in srgb, var(--accent-soft) 40%, transparent)' : 'transparent',
        }}>
          <h3 style={{
            color: 'var(--text-primary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            fontWeight: 700, margin: 0,
            fontFamily: 'var(--font-display)',
            textShadow: isAnime ? '0 0 12px var(--accent-glow)' : 'none',
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'var(--bg-elevated)', border: `1px solid var(--border)`,
              borderRadius: 'var(--btn-radius)', padding: '0.3rem',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; if (isAnime) e.currentTarget.style.boxShadow = '0 0 8px var(--accent-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none'; }}
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
