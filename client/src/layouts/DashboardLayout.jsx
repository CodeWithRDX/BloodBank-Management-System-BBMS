import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      <div
        style={{
          width: '15rem',
          flexShrink: 0,
          display: 'none',
          flexDirection: 'column',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          height: '100%',
          overflow: 'hidden',
        }}
        className="desktop-sidebar"
      >
        <DesktopSidebarInner />
      </div>

      {/* ── MOBILE SIDEBAR (overlay) ─────────────────── */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: 'var(--bg-base)',
        }}>
          <div style={{ maxWidth: '88rem', margin: '0 auto' }}>
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

// ── Inline desktop sidebar content ─────────────────────
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineBeaker,
  HiOutlineClipboardList, HiOutlineDocumentReport,
  HiOutlineCalendar, HiOutlineBell, HiOutlineHeart,
  HiOutlineSearch, HiOutlineChartBar,
} from 'react-icons/hi';

const NAV_BY_ROLE = {
  admin: [
    { name: 'Dashboard',    path: '/admin',                icon: HiOutlineChartBar,      exact: true },
    { name: 'Users',        path: '/admin/users',          icon: HiOutlineUserGroup },
    { name: 'Donors',       path: '/admin/donors',         icon: HiOutlineHeart },
    { name: 'Inventory',    path: '/admin/inventory',      icon: HiOutlineBeaker },
    { name: 'Requests',     path: '/admin/requests',       icon: HiOutlineClipboardList },
    { name: 'Appointments', path: '/admin/appointments',   icon: HiOutlineCalendar },
    { name: 'Notifications',path: '/admin/notifications',  icon: HiOutlineBell },
  ],
  donor: [
    { name: 'Dashboard',       path: '/donor',               icon: HiOutlineHome,         exact: true },
    { name: 'My Profile',      path: '/donor/profile',        icon: HiOutlineUserGroup },
    { name: 'Donation History',path: '/donor/donations',      icon: HiOutlineDocumentReport },
    { name: 'My Appointments', path: '/donor/appointments',   icon: HiOutlineCalendar },
    { name: 'Notifications',   path: '/donor/notifications',  icon: HiOutlineBell },
  ],
  hospital: [
    { name: 'Dashboard',      path: '/hospital',              icon: HiOutlineHome,         exact: true },
    { name: 'Blood Requests', path: '/hospital/requests',     icon: HiOutlineClipboardList },
    { name: 'Inventory Search',path: '/hospital/search',      icon: HiOutlineSearch },
    { name: 'Notifications',  path: '/hospital/notifications',icon: HiOutlineBell },
  ],
  staff: [
    { name: 'Dashboard',    path: '/staff',                  icon: HiOutlineHome,         exact: true },
    { name: 'Notifications',path: '/staff/notifications',    icon: HiOutlineBell },
  ],
};

const ROLE_META = {
  admin:    { label: 'Administrator', color: '#a78bfa' },
  donor:    { label: 'Blood Donor',   color: '#f87171' },
  hospital: { label: 'Hospital',      color: '#34d399' },
  staff:    { label: 'Lab Staff',     color: '#60a5fa' },
};

const DesktopSidebarInner = () => {
  const { user } = useSelector(s => s.auth);
  const { themeId, themes } = useTheme();
  const location = useLocation();
  const links = NAV_BY_ROLE[user?.role] || [];
  const meta = ROLE_META[user?.role] || {};

  const isActive = (link) =>
    link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

  return (
    <>
      {/* Logo */}
      <div style={{
        padding: '1.1rem 1rem',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            background: 'var(--accent)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <HiOutlineHeart style={{ width: '1.1rem', height: '1.1rem', color: 'white' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>BBMS</p>
            <p style={{ color: 'var(--accent)', fontSize: '0.6rem', marginTop: '0.1rem', fontWeight: 600 }}>
              {themes[themeId]?.emoji} {themes[themeId]?.label}
            </p>
          </div>
        </Link>
      </div>

      {/* User chip */}
      <div style={{
        margin: '0.75rem',
        padding: '0.75rem',
        background: 'var(--accent-soft)',
        border: `1px solid color-mix(in srgb, var(--accent) 25%, transparent)`,
        borderRadius: '0.875rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.78rem',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 0 8px var(--accent-glow)',
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
              <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{meta.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '0 0.75rem 0.75rem' }}>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0.625rem 0.5rem 0.375rem',
        }}>
          Navigation
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link${active ? ' active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.6rem 0.75rem',
                    textDecoration: 'none',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.84rem',
                  }}
                >
                  <Icon style={{
                    width: '1rem',
                    height: '1rem',
                    flexShrink: 0,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  }} />
                  {link.name}
                  {active && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '0.35rem',
                      height: '0.35rem',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      boxShadow: '0 0 6px var(--accent-glow)',
                    }} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--sidebar-border)',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.62rem' }}>BBMS v2.0 · Open Source</p>
      </div>
    </>
  );
};

export default DashboardLayout;
