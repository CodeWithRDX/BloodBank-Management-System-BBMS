import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, 
  Activity, 
  Calendar, 
  MapPin, 
  Info, 
  LogIn, 
  UserPlus, 
  LayoutDashboard,
  LogOut,
  User,
  Phone, 
  Mail, 
  Plus, 
  X 
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import ThemePicker from '../components/ThemePicker';
import AnimatedBackground from '../components/AnimatedBackground';

const PublicLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const customEase = [0.16, 1, 0.3, 1];

  const getDashboardPath = (role) => {
    if (role === 'branch_admin' || role === 'staff') return '/staff';
    if (role === 'admin') return '/admin';
    if (role === 'hospital') return '/hospital';
    return '/donor';
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const baseLinks = [
    { label: 'Home', path: '/', icon: HomeIcon },
    { label: 'Blood Availability', path: '/inventory', icon: Activity },
    { label: 'Donation Camps', path: '/camps', icon: Calendar },
    { label: 'Find Blood Banks', path: '/locator', icon: MapPin },
    { label: 'About Us', path: '/about', icon: Info },
  ];

  const authLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: getDashboardPath(user?.role), icon: LayoutDashboard },
        { label: 'Profile Settings', path: '/profile', icon: User },
      ]
    : [
        { label: 'Sign In', path: '/login', icon: LogIn },
        { label: 'Register', path: '/register', icon: UserPlus },
      ];

  const currentMenuLinks = [...baseLinks, ...authLinks];

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
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative' }}>
      {/* Animated background orbs */}
      <AnimatedBackground variant="default" />

      {/* ── HEADER — Premium Glass Transition Navbar (Sui-Style) ── */}
      <motion.nav
        className="neural-nav"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase }}
        style={{
          background: scrolled ? 'var(--glass-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(120%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(120%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.15)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="neural-nav-left">
          {/* Logo */}
          <Link to="/" className="brand-logo-container" onClick={() => setIsMenuOpen(false)}>
            <div className="brand-logo-icon">
              <svg viewBox="0 0 24 24" className="brand-logo-svg">
                <rect x="4" y="5" width="5" height="14" rx="2.5" fill="var(--accent)" />
                <rect x="15" y="5" width="5" height="14" rx="2.5" fill="var(--accent)" />
              </svg>
            </div>
            <span className="brand-text">BBMS</span>
          </Link>
          <div className="tags-pill">
            <span>Clinical Logistics</span>
            <span className="tags-pill-separator">•</span>
            <span>Donor Networks</span>
          </div>
        </div>

        <div className="neural-nav-right">
          <ThemePicker />
          {/* Menu Button trigger */}
          <button className="menu-btn" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <span className="menu-btn-circle">
              <Plus size={12} strokeWidth={3} />
            </span>
            <span className="menu-btn-text">Menu</span>
          </button>
        </div>
      </motion.nav>

      {/* ── CONTENT — push down for fixed header (except on homepage to keep absolute overlay) ── */}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2rem', height: '2rem',
                  background: 'var(--gradient-primary)',
                  borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 100 120" style={{ width: '1rem', height: '1rem', fill: 'white' }}>
                    <path d="M50,10 C50,10 90,65 90,85 C90,105 72,120 50,120 C28,120 10,105 10,85 C10,65 50,10 50,10 Z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  BBMS
                </span>
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Futuristic, high-end blood logistics network bridging donors, hospitals, and medical branches securely.
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Gateway</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Link to="/inventory" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Blood Inventory</Link>
                <Link to="/camps" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Donation Camps</Link>
                <Link to="/locator" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Find Blood Banks</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>Platform Access</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardPath(user?.role)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Dashboard</Link>
                    <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Profile Settings</Link>
                    <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Clinical About Us</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Sign In</Link>
                    <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Donor Registration</Link>
                    <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Clinical About Us</Link>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>Clinical Offices</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                100 Medical Logistics Blvd<br />
                Suite 400, Biotech Tower<br />
                San Francisco, CA 94107
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Support: info@bbms.org
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }} className="footer-bottom">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
              &copy; {new Date().getFullYear()} BBMS Clinical Logistics Portal. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Terms of Service</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Security Audit</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── RIGHT-SIDE SLIDEOVER DRAWER PANEL ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slideover panel */}
            <motion.div
              className="menu-slideover"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            >
              <div className="menu-slideover-header">
                <Link to="/" className="brand-logo-container" onClick={() => setIsMenuOpen(false)}>
                  <div className="brand-logo-icon">
                    <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', transform: 'rotate(-35deg)' }}>
                      <rect x="4" y="5" width="5" height="14" rx="2.5" fill="var(--accent)" />
                      <rect x="15" y="5" width="5" height="14" rx="2.5" fill="var(--accent)" />
                    </svg>
                  </div>
                  <span className="brand-text">BBMS</span>
                </Link>
                <button className="slideover-close-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              {/* User Identity Banner (when logged in) */}
              {isAuthenticated && user && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.875rem',
                    marginBottom: '1rem',
                    borderRadius: '0.875rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    style={{
                      width: '2.4rem',
                      height: '2.4rem',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user?.name || 'User'}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '0.15rem',
                      padding: '0.1rem 0.45rem',
                      background: 'var(--accent-soft)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '50px',
                      color: 'var(--accent)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Items with Lucide Icons */}
              <ul className="slideover-nav-list">
                {currentMenuLinks.map((link, i) => {
                  const IconComp = link.icon;
                  const active = location.pathname === link.path;
                  return (
                    <motion.li
                      key={link.path}
                      className="slideover-nav-item"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease: customEase }}
                    >
                      <Link
                        to={link.path}
                        className={`slideover-nav-link ${active ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComp size={16} />
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}

                {isAuthenticated && (
                  <motion.li
                    className="slideover-nav-item"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + currentMenuLinks.length * 0.04, duration: 0.4, ease: customEase }}
                  >
                    <button
                      onClick={handleLogout}
                      className="slideover-nav-link"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#f87171',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = '#f87171';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.li>
                )}
              </ul>

              {/* Slideover Bottom Cards */}
              <div className="slideover-bottom-cards">
                {/* Emergency Card */}
                <div className="glass-support-card emergency-portal-card">
                  <span className="card-tag">Priority Coordination</span>
                  <h4 className="card-title">Emergency Portal</h4>
                  <p className="card-desc">Quick access to emergency blood requests and hospital coordination.</p>
                  <Link
                    to={isAuthenticated ? getDashboardPath(user?.role) : "/login"}
                    className="btn-open-portal"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {isAuthenticated ? 'Open Control Panel' : 'Open Portal'}
                  </Link>
                </div>

                {/* Need Help Card */}
                <div className="glass-support-card">
                  <span className="card-tag" style={{ color: 'var(--accent-secondary)' }}>24/7 Support</span>
                  <h4 className="card-title">Need Help?</h4>
                  <p className="support-subtitle">Healthcare Coordination</p>
                  <div className="support-info-item">
                    <Phone size={12} />
                    <span>+1 (800) 555-0199</span>
                  </div>
                  <div className="support-info-item">
                    <Mail size={12} />
                    <span>emergency@bbms.org</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicLayout;
