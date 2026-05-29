import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import { updateProfile, loadUser } from '../redux/slices/authSlice';
import API from '../api/axios';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineBeaker,
  HiOutlineClipboardList, HiOutlineDocumentReport,
  HiOutlineCalendar, HiOutlineBell, HiOutlineHeart,
  HiOutlineSearch, HiOutlineChartBar, HiOutlineX, HiOutlineLockClosed,
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
    { name: 'Change Password', path: '/change-password', icon: HiOutlineLockClosed },
  ],
  donor: [
    { name: 'Dashboard',        path: '/donor',              icon: HiOutlineHome,         exact: true },
    { name: 'Donation History', path: '/donor/donations',     icon: HiOutlineDocumentReport },
    { name: 'My Appointments',  path: '/donor/appointments',  icon: HiOutlineCalendar },
    { name: 'Donation Camps',   path: '/donor/camps',         icon: HiOutlineCalendar },
    { name: 'My Eligibility',   path: '/donor/eligibility',   icon: FiCheckSquare },
    { name: 'Find Blood Bank',  path: '/locator',             icon: FiMapPin },
    { name: 'Notifications',    path: '/donor/notifications', icon: HiOutlineBell },
    { name: 'Change Password', path: '/change-password', icon: HiOutlineLockClosed },
  ],
  hospital: [
    { name: 'Dashboard',        path: '/hospital',               icon: HiOutlineHome,         exact: true },
    { name: 'Blood Requests',   path: '/hospital/requests',      icon: HiOutlineClipboardList },
    { name: 'Inventory Search', path: '/hospital/search',        icon: HiOutlineSearch },
    { name: 'Find Blood Bank',  path: '/locator',                icon: FiMapPin },
    { name: 'Notifications',    path: '/hospital/notifications', icon: HiOutlineBell },
    { name: 'Change Password', path: '/change-password', icon: HiOutlineLockClosed },
  ],
  staff: [
    { name: 'Dashboard',     path: '/staff',              icon: HiOutlineHome,  exact: true },
    { name: 'Inventory',     path: '/staff/inventory',    icon: HiOutlineBeaker },
    { name: 'Donation Camps',path: '/staff/camps',        icon: HiOutlineCalendar },
    { name: 'Notifications', path: '/staff/notifications',icon: HiOutlineBell },
    { name: 'Change Password', path: '/change-password', icon: HiOutlineLockClosed },
  ],
  branch_admin: [
    { name: 'Dashboard',     path: '/staff',              icon: HiOutlineHome,  exact: true },
    { name: 'Inventory',     path: '/staff/inventory',    icon: HiOutlineBeaker },
    { name: 'Donation Camps',path: '/staff/camps',        icon: HiOutlineCalendar },
    { name: 'Transfers',     path: '/admin/transfers',    icon: FiRepeat },
    { name: 'Notifications', path: '/staff/notifications',icon: HiOutlineBell },
    { name: 'Change Password', path: '/change-password', icon: HiOutlineLockClosed },
  ],
};

const ROLE_META = {
  admin:        { label: 'Administrator', color: '#a78bfa' },
  donor:        { label: 'Blood Donor',   color: '#f87171' },
  hospital:     { label: 'Hospital',      color: '#34d399' },
  staff:        { label: 'Lab Staff',     color: '#60a5fa' },
  branch_admin: { label: 'Branch Admin',  color: '#10b981' },
};

/* ── Shared sidebar content (desktop + mobile) ──────────── */
const SidebarContent = ({ onLinkClick }) => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const { themeId, themes } = useTheme();
  const location = useLocation();
  const links = NAV_BY_ROLE[user?.role] || [];
  const meta = ROLE_META[user?.role] || {};

  const isActive = (link) =>
    link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

  return (
    <>
      {/* ── Logo / Brand ── */}
      <div style={{
        padding: '1.1rem 1rem',
        borderBottom: '1px solid var(--glass-border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" onClick={onLinkClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Logo icon */}
          <div style={{
            width: '2.2rem', height: '2.2rem',
            background: 'var(--gradient-primary)',
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)',
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 100 120" style={{ width: '1.1rem', height: '1.1rem', fill: 'white' }}>
              <path d="M50,10 C50,10 90,65 90,85 C90,105 72,120 50,120 C28,120 10,105 10,85 C10,65 50,10 50,10 Z" />
            </svg>
          </div>

          {/* Brand name */}
          <div>
            <p style={{
              color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', lineHeight: 1,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              BBMS
            </p>
            <p style={{
              fontSize: '0.6rem', marginTop: '0.15rem', fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '0.5rem',
              padding: '0.3rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <HiOutlineX style={{ width: '1.1rem', height: '1.1rem' }} />
          </button>
        )}
      </div>

      {/* ── User chip — glass card ── */}
      <div style={{
        margin: '0.75rem',
        padding: '0.75rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--card-radius)',
        flexShrink: 0,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Avatar with gradient */}
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.78rem', color: 'white', flexShrink: 0,
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
            overflow: 'hidden',
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
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
          Navigation
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {links.map((link, i) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={onLinkClick}
                  className={`nav-link${active ? ' active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.6rem 0.75rem', textDecoration: 'none',
                    fontWeight: active ? 700 : 500, fontSize: '0.84rem',
                    position: 'relative',
                  }}
                >
                  {/* Active gradient indicator */}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg, var(--accent), var(--accent-secondary))',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                    }} />
                  )}
                  <Icon style={{
                    width: '1rem', height: '1rem', flexShrink: 0,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'color 0.2s',
                  }} />
                  {link.name}
                  {active && (
                    <div
                      style={{
                        marginLeft: 'auto',
                        width: '0.4rem', height: '0.4rem',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── AI Settings ── */}
      {user && (
        <div style={{
          padding: '0.75rem',
          margin: '0 0.75rem 0.75rem',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: '0 0 0.25rem 0',
          }}>
            🤖 AI Support
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'AI Assistant', key: 'aiAssistantEnabled', field: 'aiAssistantEnabled' },
              { label: 'Floating Bot', key: 'floatingBotWidgetEnabled', field: 'floatingBotWidgetEnabled' },
            ].map(toggle => (
              <div key={toggle.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{toggle.label}</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '2.1rem', height: '1.1rem' }}>
                  <input
                    type="checkbox"
                    checked={user[toggle.key] !== false}
                    onChange={async (e) => {
                      try {
                        await API.post('/communications/ai-toggle', { [toggle.field]: e.target.checked });
                        dispatch(loadUser());
                        toast.success(e.target.checked ? `${toggle.label} activated!` : `${toggle.label} deactivated.`);
                      } catch (err) {
                        toast.error('Failed to update settings');
                      }
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', inset: 0,
                    background: (user[toggle.key] !== false) ? 'var(--gradient-primary)' : 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '999px', transition: '0.3s',
                  }}>
                    <span style={{
                      position: 'absolute', height: '0.8rem', width: '0.8rem',
                      left: (user[toggle.key] !== false) ? 'calc(100% - 0.95rem)' : '0.1rem',
                      bottom: '0.08rem', background: '#fff', borderRadius: '50%', transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--glass-border)',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.62rem',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          BBMS v2.0 · Open Source
        </p>
      </div>
    </>
  );
};

/* ── Dashboard Layout ────────────────────────────────────── */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      return toast.error('Please enter a valid phone number');
    }
    setUpdating(true);
    try {
      await dispatch(updateProfile({ name: user.name, phone })).unwrap();
      toast.success('🎉 Mobile number updated! Welcome to BBMS.');
    } catch (err) {
      toast.error(err || 'Failed to update phone number');
    } finally {
      setUpdating(false);
    }
  };

  const isPhoneMissing = user?.role === 'donor' && (!user?.phone || user?.phone.trim() === '');

  if (isPhoneMissing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <AnimatedBackground variant="minimal" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
              fontSize: '1.5rem',
            }}>
              📱
            </div>
            <h1 style={{
              fontWeight: 800, fontSize: '1.65rem', letterSpacing: '-0.025em',
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Action Required
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.375rem' }}>
              Please complete your registration to activate your account
            </p>
          </div>

          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--accent-soft)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '0.75rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '0.5rem'
              }}>
                🔒 To secure your account and receive appointment updates, a valid <b>mobile number</b> must be added.
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mobile Number
                </label>
                <PhoneInput
                  country={'in'}
                  value={phone}
                  onChange={val => setPhone(val)}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--input-radius)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    paddingLeft: '48px'
                  }}
                  buttonStyle={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--glass-border)',
                    borderTopLeftRadius: 'var(--input-radius)',
                    borderBottomLeftRadius: 'var(--input-radius)',
                  }}
                  dropdownStyle={{
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.875rem',
                  fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  border: 'none', cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.7 : 1,
                  marginTop: '0.5rem',
                }}
              >
                {updating ? (
                  <>
                    <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                    Activating...
                  </>
                ) : (
                  <>Activate Account</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Background orbs for dashboard — subtle */}
      <AnimatedBackground variant="dashboard" />

      {/* ── DESKTOP SIDEBAR — floating glass ─────────────────────── */}
      <aside
        className="desktop-sidebar sidebar glass-surface"
        style={{
          width: '15.5rem',
          flexShrink: 0,
          display: 'none',       /* shown via @media */
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <SidebarContent onLinkClick={null} />
      </aside>

      {/* ── MOBILE SIDEBAR (overlay) — glass ───────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 20,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>
      <aside
        className="sidebar glass-surface"
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

      {/* ── MAIN CONTENT ──────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: 'clamp(0.75rem, 2vw, 1.5rem)',
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
