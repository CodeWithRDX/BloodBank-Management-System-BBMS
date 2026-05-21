import { useState } from 'react';
import { useTheme, THEMES } from '../theme/ThemeContext';
import { HiOutlineColorSwatch, HiX, HiCheck } from 'react-icons/hi';

const ThemePicker = () => {
  const { themeId, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          borderRadius: '0.75rem',
          padding: '0.4rem 0.6rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <span style={{ fontSize: '1rem' }}>{themes[themeId]?.emoji}</span>
        <HiOutlineColorSwatch style={{ width: '1rem', height: '1rem' }} />
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="animate-scaleIn"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 0.5rem)',
              zIndex: 50,
              width: '20rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              boxShadow: 'var(--card-shadow), 0 0 30px var(--accent-soft)',
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
            }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Choose Theme
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                  8 unique themes available
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                }}
              >
                <HiX style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>
            </div>

            {/* Theme Grid */}
            <div style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.values(themes).map((t) => {
                const isActive = themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setIsOpen(false); }}
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'var(--accent-soft)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg-elevated)';
                      }
                    }}
                  >
                    {/* Active check */}
                    {isActive && (
                      <span style={{
                        position: 'absolute',
                        top: '0.35rem',
                        right: '0.35rem',
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        width: '1.1rem',
                        height: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <HiCheck style={{ width: '0.65rem', height: '0.65rem', color: 'white' }} />
                      </span>
                    )}
                    <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.25rem' }}>
                      {t.emoji}
                    </span>
                    <span style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      display: 'block',
                    }}>
                      {t.label}
                    </span>
                    <span style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.68rem',
                      display: 'block',
                      marginTop: '0.1rem',
                    }}>
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemePicker;
