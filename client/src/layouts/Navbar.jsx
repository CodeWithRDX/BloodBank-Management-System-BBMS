import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2, HiOutlineBell, HiOutlineLogout, HiX } from 'react-icons/hi';
import { logout } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import ThemePicker from '../components/ThemePicker';
import usePolling from '../hooks/usePolling';
import { useTheme } from '../theme/ThemeContext';

/* Anime role greetings */
const ANIME_GREETINGS = {
  dragonball:  '⚡ Power Level: MAXIMUM',
  onepiece:    '☠️ Set Sail, Captain',
  naruto:      '🍃 Believe It!',
  deathnote:   '📓 All according to plan',
  jujutsu:     '👁️ Cursed Energy: Active',
  titan:       '⚔️ Survey Corps Ready',
  demonslayer: '🌊 Total Concentration',
};

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { themeId, theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const isAnime = theme?.group === 'anime';

  usePolling(() => {
    if (user) dispatch(fetchNotifications());
  }, 10000, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const animeGreeting = ANIME_GREETINGS[themeId];

  return (
    <header
      style={{
        height: '3.75rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 clamp(0.75rem, 2vw, 1.25rem)',
        background: isAnime
          ? `color-mix(in srgb, var(--bg-surface) 80%, transparent)`
          : `color-mix(in srgb, var(--bg-surface) 85%, transparent)`,
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${isAnime ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isAnime ? `0 1px 20px var(--anime-glow)` : 'none',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Anime energy accent line under header */}
      {isAnime && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, var(--accent), var(--energy-color), var(--accent), transparent)`,
          backgroundSize: '200% auto',
          animation: 'energyTextFlow 3s linear infinite',
        }} />
      )}

      {/* ── Hamburger / X toggle ── */}
      <button
        onClick={onMenuClick}
        style={{
          background: sidebarOpen ? 'var(--accent-soft)' : 'var(--bg-elevated)',
          border: `1px solid ${sidebarOpen ? 'color-mix(in srgb, var(--accent) 60%, transparent)' : 'var(--border)'}`,
          borderRadius: isAnime ? '0.5rem' : '0.625rem',
          padding: '0.375rem',
          cursor: 'pointer',
          color: sidebarOpen ? 'var(--accent)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s',
          flexShrink: 0,
          boxShadow: sidebarOpen ? `0 0 10px var(--accent-glow)` : 'none',
        }}
        className="lg-hidden"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={sidebarOpen}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => {
          if (!sidebarOpen) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        {sidebarOpen
          ? <HiX style={{ width: '1.2rem', height: '1.2rem' }} />
          : <HiMenuAlt2 style={{ width: '1.2rem', height: '1.2rem' }} />
        }
      </button>

      {/* ── Page title / greeting ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }} className="hide-mobile">
        {isAnime && animeGreeting ? (
          <p style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'var(--font-display)',
          }}>
            {animeGreeting}
          </p>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-body)' }}>
            {user?.name && <span style={{ color: 'var(--accent)' }}>👋 </span>}
            Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{user?.name?.split(' ')[0]}</span>
          </p>
        )}
      </div>

      {/* ── Right actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

        {/* Theme Picker */}
        <ThemePicker />

        {/* Notification bell */}
        <button
          onClick={() => navigate(`/${user?.role}/notifications`)}
          style={{
            position: 'relative',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: isAnime ? '0.5rem' : '0.75rem',
            padding: '0.4rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
            if (isAnime) e.currentTarget.style.boxShadow = `0 0 12px var(--accent-glow)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Notifications"
        >
          <HiOutlineBell style={{ width: '1.15rem', height: '1.15rem' }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-0.3rem', right: '-0.3rem',
              background: 'var(--accent)', borderRadius: '50%',
              width: '1.1rem', height: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 800, color: 'white',
              boxShadow: `0 0 8px var(--accent-glow)`,
              animation: isAnime ? 'energyPulse 2s ease-in-out infinite' : 'none',
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
              background: 'var(--bg-elevated)',
              border: `1px solid ${showProfile ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: isAnime ? '0.5rem' : '0.75rem',
              padding: '0.3rem 0.625rem 0.3rem 0.3rem',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: showProfile ? `0 0 12px var(--accent-glow)` : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {/* Avatar */}
            <div style={{
              width: '1.8rem', height: '1.8rem', borderRadius: '50%',
              background: isAnime
                ? `linear-gradient(135deg, var(--accent), var(--energy-color))`
                : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.7rem', color: 'white', flexShrink: 0,
              boxShadow: `0 0 10px var(--accent-glow)`,
            }}>
              {initials}
            </div>
            {/* Name + role — hidden on very small screens */}
            <div style={{ textAlign: 'left', overflow: 'hidden' }} className="hide-mobile">
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.78rem', lineHeight: 1, whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0]}
              </p>
              <p style={{ color: 'var(--accent)', fontSize: '0.62rem', marginTop: '0.1rem', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
          </button>

          {/* Profile dropdown menu */}
          {showProfile && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfile(false)} />
              <div
                className="animate-scaleIn profile-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.5rem)',
                  zIndex: 50,
                  width: 'min(14rem, calc(100vw - 2rem))',
                  transformOrigin: 'top right',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isAnime ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: isAnime ? '0.75rem' : '1rem',
                  boxShadow: isAnime
                    ? `var(--card-shadow), 0 0 30px var(--anime-glow)`
                    : 'var(--card-shadow)',
                  overflow: 'hidden',
                }}
              >
                {/* User info */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  {/* Anime energy bar */}
                  {isAnime && (
                    <div style={{
                      height: '2px',
                      background: `linear-gradient(90deg, var(--accent), var(--energy-color))`,
                      borderRadius: 999,
                      marginBottom: '0.625rem',
                    }} />
                  )}
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: '0.375rem',
                    padding: '0.15rem 0.5rem',
                    background: 'var(--accent-soft)',
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    borderRadius: 'var(--btn-radius)',
                    color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    fontFamily: 'var(--font-display)',
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
    </header>
  );
};

export default Navbar;
