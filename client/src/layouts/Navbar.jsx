import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2, HiOutlineBell, HiOutlineLogout, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import ThemePicker from '../components/ThemePicker';
import usePolling from '../hooks/usePolling';
import { useTheme } from '../theme/ThemeContext';

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { themeId, theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  usePolling(() => {
    if (user) dispatch(fetchNotifications());
  }, 10000, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header
      style={{
        height: '3.75rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 clamp(0.75rem, 2vw, 1.25rem)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Subtle gradient line under header */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.3), rgba(249,115,22,0.2), transparent)',
      }} />

      {/* ── Page title / greeting ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }} className="hide-mobile">
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: 'var(--font-body)',
        }}>
          {user?.name && (
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}>
              ✦{' '}
            </span>
          )}
          Welcome back,{' '}
          <span style={{
            color: 'var(--text-primary)', fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {user?.name?.split(' ')[0]}
          </span>
        </p>
      </div>

      {/* ── Right actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
        {/* ── Hamburger / X toggle (shifted to left side of right actions) ── */}
        <button
          onClick={onMenuClick}
          style={{
            background: sidebarOpen ? 'var(--accent-soft)' : 'var(--glass-bg)',
            border: `1px solid ${sidebarOpen ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`,
            borderRadius: '0.625rem',
            padding: '0.375rem',
            cursor: 'pointer',
            color: sidebarOpen ? 'var(--accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s',
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
          }}
          className="lg-hidden"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => {
            if (!sidebarOpen) {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          {sidebarOpen
            ? <HiX style={{ width: '1.2rem', height: '1.2rem' }} />
            : <HiMenuAlt2 style={{ width: '1.2rem', height: '1.2rem' }} />
          }
        </button>

        {/* Theme Picker */}
        <ThemePicker />

        {/* Notification bell with glow pulse */}
        <button
          onClick={() => navigate(`/${user?.role}/notifications`)}
          style={{
            position: 'relative',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0.75rem',
            padding: '0.4rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s',
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Notifications"
        >
          <HiOutlineBell style={{ width: '1.15rem', height: '1.15rem' }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-0.35rem', right: '-0.35rem',
              background: 'var(--gradient-primary)',
              borderRadius: '50%',
              width: '1.15rem', height: '1.15rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 800, color: 'white',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-label="User profile menu"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--glass-bg)',
              border: `1px solid ${showProfile ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`,
              borderRadius: '0.75rem',
              padding: '0.3rem 0.625rem 0.3rem 0.3rem',
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: showProfile ? '0 0 16px var(--accent-glow)' : 'none',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            {/* Avatar with gradient */}
            <div style={{
              width: '1.8rem', height: '1.8rem', borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.7rem', color: 'white', flexShrink: 0,
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)',
              overflow: 'hidden',
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            {/* Name + role */}
            <div style={{ textAlign: 'left', overflow: 'hidden' }} className="hide-mobile">
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.78rem', lineHeight: 1, whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0]}
              </p>
              <p style={{
                fontSize: '0.6rem', marginTop: '0.1rem', textTransform: 'capitalize',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 600,
              }}>
                {user?.role}
              </p>
            </div>
          </button>

          {/* Profile dropdown menu — glass panel */}
          <AnimatePresence>
            {showProfile && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="profile-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.5rem)',
                    zIndex: 50,
                    width: 'min(14rem, calc(100vw - 2rem))',
                    transformOrigin: 'top right',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(24px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(130%)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '1rem',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Gradient accent line */}
                  <div style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary), var(--accent))',
                  }} />

                  {/* User info */}
                  <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <p style={{
                      color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>{user?.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                    <span style={{
                      display: 'inline-block', marginTop: '0.375rem',
                      padding: '0.15rem 0.5rem',
                      background: 'var(--accent-soft)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '50px',
                      color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      {user?.role}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '0.375rem' }}>
                    {[
                      { label: 'Profile Settings', path: '/profile', show: true },
                      { label: 'Change Password', path: '/change-password', show: user?.oauthProvider === 'local' || !user?.oauthProvider },
                    ].filter(i => i.show).map(item => (
                      <button
                        key={item.path}
                        onClick={() => { setShowProfile(false); navigate(item.path); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                          padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                          borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--text-primary)',
                          fontSize: '0.82rem', fontWeight: 500, textAlign: 'left', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        borderRadius: '0.625rem', cursor: 'pointer', color: '#f87171',
                        fontSize: '0.82rem', fontWeight: 500, textAlign: 'left', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <HiOutlineLogout style={{ width: '0.9rem', height: '0.9rem' }} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
