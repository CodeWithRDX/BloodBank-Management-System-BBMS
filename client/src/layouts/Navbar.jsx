import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2, HiOutlineBell, HiOutlineLogout, HiX } from 'react-icons/hi';
import { logout } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import ThemePicker from '../components/ThemePicker';
import usePolling from '../hooks/usePolling';

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
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
    <header style={{
      height: '3.75rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0 1.25rem',
      background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '0.625rem',
          padding: '0.375rem',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s',
        }}
        className="lg-hidden"
        aria-label="Open menu"
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <HiMenuAlt2 style={{ width: '1.2rem', height: '1.2rem' }} />
      </button>

      {/* Page title breadcrumb */}
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
          {user?.name && <span style={{ color: 'var(--accent)' }}>👋</span>} Welcome back, {user?.name?.split(' ')[0]}
        </p>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme Picker */}
        <ThemePicker />

        {/* Notifications Bell */}
        <button
          onClick={() => navigate(`/${user?.role}/notifications`)}
          style={{
            position: 'relative',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            padding: '0.4rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          aria-label="Notifications"
        >
          <HiOutlineBell style={{ width: '1.15rem', height: '1.15rem' }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-0.3rem',
              right: '-0.3rem',
              background: 'var(--accent)',
              borderRadius: '50%',
              width: '1.1rem',
              height: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 0 6px var(--accent-glow)',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              padding: '0.3rem 0.625rem 0.3rem 0.3rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{
              width: '1.8rem',
              height: '1.8rem',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.7rem',
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 0 8px var(--accent-glow)',
            }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.78rem', lineHeight: 1 }}>
                {user?.name?.split(' ')[0]}
              </p>
              <p style={{ color: 'var(--accent)', fontSize: '0.62rem', marginTop: '0.1rem', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
          </button>

          {showProfile && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfile(false)} />
              <div
                className="animate-scaleIn"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.5rem)',
                  zIndex: 50,
                  width: '14rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '1rem',
                  boxShadow: 'var(--card-shadow)',
                  overflow: 'hidden',
                }}
              >
                {/* User info */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.375rem',
                    padding: '0.15rem 0.5rem',
                    background: 'var(--accent-soft)',
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    borderRadius: '0.375rem',
                    color: 'var(--accent)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {user?.role}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '0.375rem' }}>
                  {user?.role === 'donor' && (
                    <button
                      onClick={() => { setShowProfile(false); navigate('/donor/profile'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--text-primary)',
                        fontSize: '0.82rem', fontWeight: 500, textAlign: 'left', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    >
                      Profile Settings
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                      padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                      borderRadius: '0.625rem', cursor: 'pointer', color: '#f87171',
                      fontSize: '0.82rem', fontWeight: 500, textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <HiOutlineLogout style={{ width: '0.9rem', height: '0.9rem' }} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
