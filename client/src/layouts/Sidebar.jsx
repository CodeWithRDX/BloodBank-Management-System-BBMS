import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import { 
  HiOutlineHome, 
  HiOutlineUserGroup, 
  HiOutlineBeaker, 
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineCalendar,
  HiOutlineBell,
  HiOutlineHeart,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineChartBar,
} from 'react-icons/hi';
import {
  FiMapPin, FiUsers, FiActivity, FiRepeat,
  FiFileText, FiBarChart2, FiCalendar, FiCheckSquare,
} from 'react-icons/fi';

const NAV_BY_ROLE = {
  admin: [
    { name: 'Dashboard', path: '/admin', icon: HiOutlineChartBar, exact: true },
    { name: 'Users', path: '/admin/users', icon: HiOutlineUserGroup },
    { name: 'Donors', path: '/admin/donors', icon: HiOutlineHeart },
    { name: 'Branches', path: '/admin/branches', icon: FiMapPin },
    { name: 'Staff', path: '/admin/staff', icon: FiUsers },
    { name: 'Inventory', path: '/admin/inventory', icon: HiOutlineBeaker },
    { name: 'Requests', path: '/admin/requests', icon: HiOutlineClipboardList },
    { name: 'Camps', path: '/admin/camps', icon: HiOutlineCalendar },
    { name: 'Transfers', path: '/admin/transfers', icon: FiRepeat },
    { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
    { name: 'Logs', path: '/admin/logs', icon: FiFileText },
    { name: 'Appointments', path: '/admin/appointments', icon: HiOutlineCalendar },
    { name: 'Notifications', path: '/admin/notifications', icon: HiOutlineBell },
  ],
  donor: [
    { name: 'Dashboard', path: '/donor', icon: HiOutlineHome, exact: true },
    { name: 'My Profile', path: '/donor/profile', icon: HiOutlineUserGroup },
    { name: 'Donation History', path: '/donor/donations', icon: HiOutlineDocumentReport },
    { name: 'My Appointments', path: '/donor/appointments', icon: HiOutlineCalendar },
    { name: 'Donation Camps', path: '/donor/camps', icon: HiOutlineCalendar },
    { name: 'My Eligibility', path: '/donor/eligibility', icon: FiCheckSquare },
    { name: 'Find Blood Bank', path: '/locator', icon: FiMapPin },
    { name: 'Notifications', path: '/donor/notifications', icon: HiOutlineBell },
  ],
  hospital: [
    { name: 'Dashboard', path: '/hospital', icon: HiOutlineHome, exact: true },
    { name: 'Blood Requests', path: '/hospital/requests', icon: HiOutlineClipboardList },
    { name: 'Inventory Search', path: '/hospital/search', icon: HiOutlineSearch },
    { name: 'Find Blood Bank', path: '/locator', icon: FiMapPin },
    { name: 'Notifications', path: '/hospital/notifications', icon: HiOutlineBell },
  ],
  staff: [
    { name: 'Dashboard', path: '/staff', icon: HiOutlineHome, exact: true },
    { name: 'Inventory', path: '/staff/inventory', icon: HiOutlineBeaker },
    { name: 'Donation Camps', path: '/staff/camps', icon: HiOutlineCalendar },
    { name: 'Notifications', path: '/staff/notifications', icon: HiOutlineBell },
  ],
  branch_admin: [
    { name: 'Dashboard', path: '/staff', icon: HiOutlineHome, exact: true },
    { name: 'Inventory', path: '/staff/inventory', icon: HiOutlineBeaker },
    { name: 'Donation Camps', path: '/staff/camps', icon: HiOutlineCalendar },
    { name: 'Transfers', path: '/admin/transfers', icon: FiRepeat },
    { name: 'Notifications', path: '/staff/notifications', icon: HiOutlineBell },
  ],
};

const ROLE_COLORS = {
  admin:    { label: 'Administrator', dot: '#a78bfa' },
  donor:    { label: 'Blood Donor',   dot: '#f87171' },
  hospital: { label: 'Hospital',      dot: '#34d399' },
  staff:    { label: 'Lab Staff',     dot: '#60a5fa' },
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const { themeId, themes } = useTheme();
  const location = useLocation();
  const links = NAV_BY_ROLE[user?.role] || [];
  const roleInfo = ROLE_COLORS[user?.role] || {};

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className="sidebar animate-slideInLeft"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
          width: '15rem',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(.22,.61,.36,1)',
        }}
      >
        {/* Logo area */}
        <div style={{
          padding: '1.25rem 1rem 1rem',
          borderBottom: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {/* Logo mark */}
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'var(--accent)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--accent-glow)',
              flexShrink: 0,
            }}>
              <HiOutlineHeart style={{ width: '1.1rem', height: '1.1rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
                BBMS
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', marginTop: '0.1rem' }}>
                {themes[themeId]?.emoji} {themes[themeId]?.label}
              </p>
            </div>
          </Link>
          {/* Mobile close */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              padding: '0.3rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
            }}
            aria-label="Close sidebar"
          >
            <HiOutlineX style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* User info */}
        <div style={{
          padding: '0.875rem 1rem',
          margin: '0.75rem 0.75rem 0',
          background: 'var(--accent-soft)',
          border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
          borderRadius: '0.875rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2.2rem',
              height: '2.2rem',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: 'white',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                <div style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: roleInfo.dot, flexShrink: 0 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{roleInfo.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
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
                    onClick={() => setIsOpen(false)}
                    className={`nav-link ${active ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      textDecoration: 'none',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    <Icon style={{
                      width: '1.1rem',
                      height: '1.1rem',
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

        {/* Footer */}
        <div style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textAlign: 'center' }}>
            Blood Bank Management System
          </p>
          <p style={{ color: 'var(--accent)', fontSize: '0.65rem', textAlign: 'center', marginTop: '0.1rem' }}>
            v2.0.0
          </p>
        </div>
      </aside>

      {/* Desktop static sidebar */}
      <aside
        className="sidebar"
        style={{
          display: 'none',
          width: '15rem',
          flexShrink: 0,
          flexDirection: 'column',
          height: '100%',
        }}
        /* Shown via media query below — injected via JS trick */
      />
    </>
  );
};

export default Sidebar;
