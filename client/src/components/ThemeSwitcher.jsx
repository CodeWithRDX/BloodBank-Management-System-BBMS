import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../theme/ThemeContext';

const ThemeSwitcher = () => {
  const { themeId, setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEMES[themeId];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(p => !p)}
        title="Switch Theme"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.4rem 0.75rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '0.625rem',
          cursor: 'pointer', fontSize: '0.8rem',
          fontWeight: 600, color: 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <span style={{ fontSize: '1rem' }}>{current.emoji}</span>
        <span style={{ display: 'none', fontFamily: "'Space Grotesk', sans-serif" }}
          className="sm:inline"
        >{current.label}</span>
        <svg style={{ width: '0.75rem', height: '0.75rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
          width: '15rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden', zIndex: 100,
          animation: 'dropIn 0.18s ease both',
        }}>
          {/* Header */}
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Choose Theme
            </p>
          </div>

          {/* Theme options */}
          <ul style={{ listStyle: 'none', padding: '0.375rem', margin: 0, maxHeight: '22rem', overflowY: 'auto' }}>
            {Object.values(THEMES).map(t => (
              <li key={t.id}>
                <button
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                    border: `1px solid ${themeId === t.id ? 'var(--accent)' : 'transparent'}`,
                    background: themeId === t.id ? 'var(--accent-soft)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (themeId !== t.id) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={e => { if (themeId !== t.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Color swatch + emoji */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: t.vars['--accent'], boxShadow: `0 0 6px ${t.vars['--accent-glow']}`, flexShrink: 0 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: themeId === t.id ? 700 : 500, fontSize: '0.82rem', lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{t.label}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                  </div>
                  {themeId === t.id && (
                    <svg style={{ width: '0.85rem', height: '0.85rem', color: 'var(--accent)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sm\\:inline { display: none; }
        @media (min-width: 640px) { .sm\\:inline { display: inline !important; } }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;
