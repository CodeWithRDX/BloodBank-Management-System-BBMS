import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../theme/ThemeContext';
import { HiOutlineColorSwatch, HiX, HiCheck } from 'react-icons/hi';

const classicThemes = Object.values(THEMES).filter(t => t.group === 'classic');
const animeThemes   = Object.values(THEMES).filter(t => t.group === 'anime');

const ThemePicker = () => {
  const { themeId, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentTheme = THEMES[themeId];

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  /* Lock body scroll on mobile when panel is open */
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Change Theme"
        aria-label="Open theme picker"
        aria-expanded={isOpen}
        style={{
          background: isOpen ? 'var(--accent-soft)' : 'var(--bg-elevated)',
          border: `1px solid ${isOpen ? 'color-mix(in srgb, var(--accent) 60%, transparent)' : 'var(--border)'}`,
          color: isOpen ? 'var(--accent)' : 'var(--text-secondary)',
          borderRadius: '0.75rem',
          padding: '0.4rem 0.65rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          flexShrink: 0,
          boxShadow: isOpen ? `0 0 12px var(--accent-glow)` : 'none',
        }}
      >
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{currentTheme?.emoji}</span>
        <HiOutlineColorSwatch style={{ width: '1rem', height: '1rem' }} />
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Mobile full-screen backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 48, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel — viewport-safe positioning */}
          <div
            className="animate-scaleIn"
            style={{
              position: 'fixed',
              top: '4.5rem',
              right: '0.75rem',
              zIndex: 49,
              width: 'min(22rem, calc(100vw - 1.5rem))',
              maxHeight: 'calc(100dvh - 5.5rem)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '1.25rem',
              boxShadow: `var(--card-shadow), 0 0 40px var(--accent-soft)`,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: 'var(--bg-elevated)',
            }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                  🎨 Choose Theme
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.1rem' }}>
                  3 classic + 7 anime · Active: {currentTheme?.label}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close theme picker"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '0.3rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <HiX style={{ width: '0.9rem', height: '0.9rem' }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0.75rem' }}>
              {/* ── Classic Themes ── */}
              <ThemeGroup
                label="⚡ Classic"
                themes={classicThemes}
                activeId={themeId}
                onSelect={(id) => { setTheme(id); setIsOpen(false); }}
              />

              <div style={{ height: 1, background: 'var(--border)', margin: '0.75rem 0' }} />

              {/* ── Anime Themes ── */}
              <ThemeGroup
                label="🎌 Anime Series"
                themes={animeThemes}
                activeId={themeId}
                onSelect={(id) => { setTheme(id); setIsOpen(false); }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Theme group section ── */
const ThemeGroup = ({ label, themes, activeId, onSelect }) => (
  <div>
    <p style={{
      color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      margin: '0 0.25rem 0.5rem',
    }}>
      {label}
    </p>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(8.5rem, 100%), 1fr))',
      gap: '0.45rem',
    }}>
      {themes.map(t => {
        const isActive = activeId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              background: isActive ? 'var(--accent-soft)' : 'var(--bg-elevated)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '0.875rem',
              padding: '0.625rem 0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s ease',
              position: 'relative',
              boxShadow: isActive ? `0 0 14px var(--accent-glow)` : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'var(--accent-soft)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.transform = '';
              }
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <span style={{
                position: 'absolute', top: '0.3rem', right: '0.3rem',
                background: 'var(--accent)', borderRadius: '50%',
                width: '1rem', height: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px var(--accent-glow)',
              }}>
                <HiCheck style={{ width: '0.6rem', height: '0.6rem', color: 'white' }} />
              </span>
            )}
            {/* Emoji */}
            <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '0.2rem', lineHeight: 1 }}>
              {t.emoji}
            </span>
            {/* Label */}
            <span style={{
              color: isActive ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: 700, fontSize: '0.75rem', display: 'block', lineHeight: 1.2,
            }}>
              {t.label}
            </span>
            {/* Description */}
            <span style={{
              color: 'var(--text-secondary)', fontSize: '0.65rem',
              display: 'block', marginTop: '0.2rem', lineHeight: 1.3,
            }}>
              {t.description}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default ThemePicker;
