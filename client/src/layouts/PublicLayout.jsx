import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import ThemePicker from '../components/ThemePicker';
import AnimatedBackground from '../components/AnimatedBackground';

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
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  // Track scroll for transparent → glass navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative' }}>
      {/* Animated background orbs */}
      <AnimatedBackground variant="default" />

      {/* ── HEADER — Transparent → Glass on scroll (Sui-style) ── */}
      <header
        ref={headerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled
            ? 'var(--glass-bg)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(120%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(120%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.15)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '4.5rem', gap: '2rem' }}>
            {/* Logo with gradient glow */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <div style={{
                width: '2.5rem', height: '2.5rem',
                background: 'var(--gradient-primary)',
                borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.35), 0 0 40px rgba(239, 68, 68, 0.1)',
                transition: 'all 0.3s ease',
              }}>
                <svg viewBox="0 0 100 120" style={{ width: '1.25rem', height: '1.25rem', fill: 'white' }}>
                  <path d="M50,10 C50,10 90,65 90,85 C90,105 72,120 50,120 C28,120 10,105 10,85 C10,65 50,10 50,10 Z" />
                </svg>
              </div>
              <span style={{
                fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.02em',
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                BB<span style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>MS</span>
              </span>
            </Link>

            {/* Desktop nav — center aligned */}
            <nav style={{ display: 'none', flex: 1, gap: '0.375rem', alignItems: 'center', justifyContent: 'center' }} className="desktop-nav">
              {NAV_LINKS.map(link => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      background: active ? 'var(--accent-soft)' : 'transparent',
                      border: `1px solid ${active ? 'rgba(239, 68, 68, 0.2)' : 'transparent'}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Spacer (mobile only) */}
            <div style={{ flex: 1 }} className="mobile-spacer" />

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <ThemePicker />

              {isAuthenticated ? (
                <Link
                  to={`/${user?.role}`}
                  className="btn-primary header-cta-btn"
                  style={{
                    padding: '0.55rem 1.25rem',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  Dashboard
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: '0.5rem 1rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      borderRadius: '50px',
                      transition: 'all 0.3s',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.background = 'var(--glass-bg)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    className="hide-mobile"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary header-cta-btn"
                    style={{
                      padding: '0.55rem 1.25rem',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    Get Started
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: mobileOpen ? 'var(--accent-soft)' : 'var(--glass-bg)',
                  border: `1px solid ${mobileOpen ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`,
                  borderRadius: '0.75rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: mobileOpen ? 'var(--accent)' : 'var(--text-secondary)',
                  display: 'none',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(8px)',
                }}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <HiX style={{ width: '1.25rem', height: '1.25rem' }} /> : <HiMenuAlt3 style={{ width: '1.25rem', height: '1.25rem' }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav — glass dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                overflow: 'hidden',
                borderTop: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        padding: '0.75rem 0.75rem',
                        color: location.pathname === link.path ? 'var(--accent)' : 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontWeight: location.pathname === link.path ? 600 : 500,
                        fontSize: '0.95rem',
                        borderRadius: '0.75rem',
                        display: 'block',
                        transition: 'all 0.2s',
                        background: location.pathname === link.path ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile auth links */}
                {isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.3 }}
                    style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}
                  >
                    <Link
                      to={`/${user?.role}`}
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary"
                      style={{
                        padding: '0.6rem 0.75rem',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'block',
                        textAlign: 'center',
                      }}
                    >
                      Go to Dashboard
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.3 }}
                    style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        padding: '0.75rem 0.75rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        display: 'block',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary"
                      style={{
                        padding: '0.6rem 0.75rem',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'block',
                        textAlign: 'center',
                      }}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── CONTENT — push down for fixed header ── */}
      <main style={{ flex: 1, paddingTop: isHome ? 0 : '4.5rem', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>

      {/* ── FOOTER — Premium glass footer ── */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--glass-border)',
        padding: '3rem 1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
            {/* Brand */}
            <div style={{ maxWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '2rem', height: '2rem',
                  background: 'var(--gradient-primary)',
                  borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.25)',
                }}>
                  <svg viewBox="0 0 100 120" style={{ width: '1rem', height: '1rem', fill: 'white' }}>
                    <path d="M50,10 C50,10 90,65 90,85 C90,105 72,120 50,120 C28,120 10,105 10,85 C10,65 50,10 50,10 Z" />
                  </svg>
                </div>
                <span style={{
                  fontWeight: 800, fontSize: '1.1rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--text-primary)',
                }}>
                  BBMS
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Next-generation Blood Bank Management System. Connecting donors, hospitals, and lives through technology.
              </p>
            </div>

            {/* Links columns */}
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Platform</p>
                {NAV_LINKS.map(l => (
                  <Link
                    key={l.path}
                    to={l.path}
                    style={{
                      display: 'block', color: 'var(--text-secondary)', textDecoration: 'none',
                      fontSize: '0.85rem', padding: '0.3rem 0', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Quick Access</p>
                {[
                  { label: 'Find Blood Banks', path: '/locator' },
                  { label: 'Sign In', path: '/login' },
                  { label: 'Register', path: '/register' },
                ].map(l => (
                  <Link
                    key={l.path}
                    to={l.path}
                    style={{
                      display: 'block', color: 'var(--text-secondary)', textDecoration: 'none',
                      fontSize: '0.85rem', padding: '0.3rem 0', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)',
            marginBottom: '1.25rem',
          }} />

          {/* Bottom row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} BBMS. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy', 'Terms', 'Contact'].map(item => (
                <span
                  key={item}
                  style={{
                    color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
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
          .header-cta-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
