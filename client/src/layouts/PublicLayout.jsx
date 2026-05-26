import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import ThemePicker from '../components/ThemePicker';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Blood Availability', path: '/inventory' },
  { label: 'Donation Camps', path: '/camps' },
  { label: 'About Us', path: '/about' },
];

const PublicLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* ── HEADER ───────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '4rem', gap: '2rem' }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              <div style={{
                width: '2.25rem', height: '2.25rem',
                background: 'var(--accent)',
                borderRadius: '0.625rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px var(--accent-glow)',
              }}>
                <svg viewBox="0 0 100 120" style={{ width: '1.15rem', height: '1.15rem', fill: 'white' }}>
                  <path d="M50,10 C50,10 90,65 90,85 C90,105 72,120 50,120 C28,120 10,105 10,85 C10,65 50,10 50,10 Z" />
                </svg>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                BB<span style={{ color: 'var(--accent)' }}>MS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav style={{ display: 'none', flex: 1, gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
              {NAV_LINKS.map(link => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      padding: '0.4rem 0.875rem',
                      borderRadius: '0.625rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      background: active ? 'var(--accent-soft)' : 'transparent',
                      border: `1px solid ${active ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} className="mobile-spacer" />

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              <ThemePicker />

              {isAuthenticated ? (
                <Link
                  to={`/${user?.role}`}
                  style={{
                    padding: '0.45rem 1rem',
                    background: 'var(--accent)',
                    color: 'white',
                    borderRadius: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    boxShadow: '0 0 14px var(--accent-glow)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                >
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: '0.45rem 0.875rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      borderRadius: '0.625rem',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    className="hide-mobile"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      padding: '0.45rem 1rem',
                      background: 'var(--accent)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      boxShadow: '0 0 14px var(--accent-glow)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.625rem',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'none',
                }}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <HiX style={{ width: '1.2rem', height: '1.2rem' }} /> : <HiMenuAlt3 style={{ width: '1.2rem', height: '1.2rem' }} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div
              className="animate-fadeUp"
              style={{
                borderTop: '1px solid var(--border)',
                padding: '0.75rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    color: location.pathname === link.path ? 'var(--accent)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🩸</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>BBMS</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>— Blood Bank Management System</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.path} to={l.path} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} BBMS. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-spacer { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
