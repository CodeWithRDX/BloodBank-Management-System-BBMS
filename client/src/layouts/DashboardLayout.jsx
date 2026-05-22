import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineBeaker,
  HiOutlineClipboardList, HiOutlineDocumentReport,
  HiOutlineCalendar, HiOutlineBell, HiOutlineHeart,
  HiOutlineSearch, HiOutlineChartBar, HiOutlineX,
} from 'react-icons/hi';
import {
  FiMapPin, FiUsers, FiRepeat, FiBarChart2, FiFileText, FiCheckSquare, FiActivity,
} from 'react-icons/fi';
import Navbar from './Navbar';

/* ── Complete nav config for every role ──────────────────── */
const NAV_BY_ROLE = {
  admin: [
    { name: 'Dashboard',     path: '/admin',              icon: HiOutlineChartBar,      exact: true },
    { name: 'Users',         path: '/admin/users',         icon: HiOutlineUserGroup },
    { name: 'Donors',        path: '/admin/donors',        icon: HiOutlineHeart },
    { name: 'Branches',      path: '/admin/branches',      icon: FiMapPin },
    { name: 'Staff',         path: '/admin/staff',         icon: FiUsers },
    { name: 'Inventory',     path: '/admin/inventory',     icon: HiOutlineBeaker },
    { name: 'Requests',      path: '/admin/requests',      icon: HiOutlineClipboardList },
    { name: 'Camps',         path: '/admin/camps',         icon: HiOutlineCalendar },
    { name: 'Transfers',     path: '/admin/transfers',     icon: FiRepeat },
    { name: 'Analytics',     path: '/admin/analytics',     icon: FiBarChart2 },
    { name: 'Logs',          path: '/admin/logs',          icon: FiFileText },
    { name: 'Appointments',  path: '/admin/appointments',  icon: FiActivity },
    { name: 'Notifications', path: '/admin/notifications', icon: HiOutlineBell },
  ],
  donor: [
    { name: 'Dashboard',        path: '/donor',              icon: HiOutlineHome,         exact: true },
    { name: 'My Profile',       path: '/donor/profile',       icon: HiOutlineUserGroup },
    { name: 'Donation History', path: '/donor/donations',     icon: HiOutlineDocumentReport },
    { name: 'My Appointments',  path: '/donor/appointments',  icon: HiOutlineCalendar },
    { name: 'Donation Camps',   path: '/donor/camps',         icon: HiOutlineCalendar },
    { name: 'My Eligibility',   path: '/donor/eligibility',   icon: FiCheckSquare },
    { name: 'Find Blood Bank',  path: '/locator',             icon: FiMapPin },
    { name: 'Notifications',    path: '/donor/notifications', icon: HiOutlineBell },
  ],
  hospital: [
    { name: 'Dashboard',        path: '/hospital',               icon: HiOutlineHome,         exact: true },
    { name: 'Blood Requests',   path: '/hospital/requests',      icon: HiOutlineClipboardList },
    { name: 'Inventory Search', path: '/hospital/search',        icon: HiOutlineSearch },
    { name: 'Find Blood Bank',  path: '/locator',                icon: FiMapPin },
    { name: 'Notifications',    path: '/hospital/notifications', icon: HiOutlineBell },
  ],
  staff: [
    { name: 'Dashboard',     path: '/staff',              icon: HiOutlineHome,  exact: true },
    { name: 'Inventory',     path: '/staff/inventory',    icon: HiOutlineBeaker },
    { name: 'Donation Camps',path: '/staff/camps',        icon: HiOutlineCalendar },
    { name: 'Notifications', path: '/staff/notifications',icon: HiOutlineBell },
  ],
  branch_admin: [
    { name: 'Dashboard',     path: '/staff',              icon: HiOutlineHome,  exact: true },
    { name: 'Inventory',     path: '/staff/inventory',    icon: HiOutlineBeaker },
    { name: 'Donation Camps',path: '/staff/camps',        icon: HiOutlineCalendar },
    { name: 'Transfers',     path: '/admin/transfers',    icon: FiRepeat },
    { name: 'Notifications', path: '/staff/notifications',icon: HiOutlineBell },
  ],
};

const ROLE_META = {
  admin:        { label: 'Administrator', color: '#a78bfa' },
  donor:        { label: 'Blood Donor',   color: '#f87171' },
  hospital:     { label: 'Hospital',      color: '#34d399' },
  staff:        { label: 'Lab Staff',     color: '#60a5fa' },
  branch_admin: { label: 'Branch Admin',  color: '#10b981' },
};

/* Anime logos per theme */
const ANIME_LOGOS = {
  dragonball:  '🔥',
  onepiece:    '☠️',
  naruto:      '🍃',
  deathnote:   '📓',
  jujutsu:     '👁️',
  titan:       '⚔️',
  demonslayer: '🌊',
};

/* ── Shared sidebar content (desktop + mobile) ──────────── */
const SidebarContent = ({ onLinkClick }) => {
  const { user } = useSelector(s => s.auth);
  const { themeId, themes, theme } = useTheme();
  const location = useLocation();
  const links = NAV_BY_ROLE[user?.role] || [];
  const meta = ROLE_META[user?.role] || {};
  const isAnime = theme?.group === 'anime';
  const animeLogo = ANIME_LOGOS[themeId];

  const isActive = (link) =>
    link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

  return (
    <>
      {/* ── Logo / Brand ── */}
      <div style={{
        padding: '1.1rem 1rem',
        borderBottom: `1px solid ${isAnime ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--sidebar-border)'}`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isAnime ? 'color-mix(in srgb, var(--accent-soft) 50%, transparent)' : 'transparent',
      }}>
        <Link to="/" onClick={onLinkClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Logo icon */}
          <div style={{
            width: '2.2rem', height: '2.2rem',
            background: isAnime
              ? `linear-gradient(135deg, var(--accent), var(--energy-color))`
              : 'var(--accent)',
            borderRadius: isAnime ? '0.5rem' : '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px var(--accent-glow)`,
            flexShrink: 0,
            animation: isAnime ? 'energyPulse 3s ease-in-out infinite' : 'none',
            fontSize: isAnime ? '1rem' : undefined,
          }}>
            {isAnime
              ? <span style={{ lineHeight: 1 }}>{animeLogo}</span>
              : <HiOutlineHeart style={{ width: '1.1rem', height: '1.1rem', color: 'white' }} />
            }
          </div>

          {/* Brand name */}
          <div>
            <p style={{
              color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', lineHeight: 1,
              fontFamily: 'var(--font-display)',
              letterSpacing: isAnime ? '0.05em' : 'normal',
              textTransform: (themeId === 'titan' || themeId === 'dragonball') ? 'uppercase' : 'none',
            }}>
              BBMS
            </p>
            <p style={{
              color: 'var(--accent)',
              fontSize: '0.6rem', marginTop: '0.15rem', fontWeight: 600,
              fontFamily: 'var(--font-display)',
              letterSpacing: isAnime ? '0.08em' : 'normal',
            }}>
              {themes[themeId]?.emoji} {themes[themeId]?.label}
            </p>
          </div>
        </Link>

        {/* X close — mobile only */}
        {onLinkClick && (
          <button
            onClick={onLinkClick}
            aria-label="Close sidebar"
            style={{
              background: 'var(--bg-elevated)',
              border: `1px solid var(--border)`,
              borderRadius: '0.5rem',
              padding: '0.3rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <HiOutlineX style={{ width: '1.1rem', height: '1.1rem' }} />
          </button>
        )}
      </div>

      {/* ── User chip ── */}
      <div style={{
        margin: '0.75rem',
        padding: '0.75rem',
        background: isAnime
          ? `color-mix(in srgb, var(--accent) 8%, var(--bg-elevated))`
          : 'var(--accent-soft)',
        border: `1px solid ${isAnime ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'color-mix(in srgb, var(--accent) 25%, transparent)'}`,
        borderRadius: 'var(--card-radius)',
        flexShrink: 0,
        boxShadow: isAnime ? `0 0 12px var(--anime-glow)` : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Avatar */}
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: isAnime
              ? `linear-gradient(135deg, var(--accent), var(--energy-color))`
              : 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.78rem', color: 'white', flexShrink: 0,
            boxShadow: `0 0 10px var(--accent-glow)`,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
              <div style={{
                width: '0.45rem', height: '0.45rem', borderRadius: '50%',
                background: meta.color, flexShrink: 0,
                boxShadow: `0 0 6px ${meta.color}`,
                animation: isAnime ? 'navDotPulse 2s ease-in-out infinite' : 'none',
              }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{meta.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '0 0.75rem 0.75rem' }}>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          margin: '0.625rem 0.5rem 0.375rem',
        }}>
          {isAnime ? '▸ Navigation' : 'Navigation'}
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {links.map((link, i) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <li key={link.path} style={{ animationDelay: `${i * 30}ms` }}>
                <Link
                  to={link.path}
                  onClick={onLinkClick}
                  className={`nav-link${active ? ' active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.6rem 0.75rem', textDecoration: 'none',
                    fontWeight: active ? 700 : 500, fontSize: '0.84rem',
                  }}
                >
                  <Icon style={{
                    width: '1rem', height: '1rem', flexShrink: 0,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    filter: active && isAnime ? `drop-shadow(0 0 4px var(--accent-glow))` : 'none',
                  }} />
                  {link.name}
                  {active && (
                    <div
                      className="nav-dot"
                      style={{
                        marginLeft: 'auto',
                        width: '0.4rem', height: '0.4rem',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        boxShadow: `0 0 8px var(--accent-glow)`,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: '0.75rem',
        borderTop: `1px solid ${isAnime ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'var(--sidebar-border)'}`,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.62rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: isAnime ? '0.05em' : 'normal',
        }}>
          {isAnime ? `[ BBMS v2.0 ]` : 'BBMS v2.0 · Open Source'}
        </p>
      </div>
    </>
  );
};

/* ── Dashboard Layout ────────────────────────────────────── */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── DESKTOP SIDEBAR ─────────────────────── */}
      <aside
        className="desktop-sidebar sidebar"
        style={{
          width: '15.5rem',
          flexShrink: 0,
          display: 'none',       /* shown via @media */
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <SidebarContent onLinkClick={null} />
      </aside>

      {/* ── MOBILE SIDEBAR (overlay) ───────────── */}
      <>
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 20,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={closeSidebar}
          />
        )}
        <aside
          className="sidebar"
          style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
            width: 'min(16rem, 85vw)',
            display: 'flex', flexDirection: 'column',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(.22,.61,.36,1)',
            overflowY: 'auto',
          }}
        >
          <SidebarContent onLinkClick={closeSidebar} />
        </aside>
      </>

      {/* ── MAIN CONTENT ──────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: 'clamp(0.75rem, 2vw, 1.5rem)',
          background: 'var(--bg-base)',
        }}>
          <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
