import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;
import {
  HiOutlineHeart, HiOutlineBeaker, HiOutlineShieldCheck,
  HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineGlobe, HiOutlineClipboardCheck,
} from 'react-icons/hi';


const STATS = [
  { value: '50K+',  label: 'Lives Saved',       icon: '❤️'  },
  { value: '1,200', label: 'Registered Donors',  icon: '👤'  },
  { value: '85+',   label: 'Partner Hospitals',  icon: '🏥'  },
  { value: '99.9%', label: 'System Uptime',       icon: '⚡'  },
];

const FEATURES = [
  {
    icon: HiOutlineHeart,
    title: 'Smart Donor Management',
    description: 'Track donors, eligibility status, donation history and schedule appointments in one place.',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.2)',
  },
  {
    icon: HiOutlineBeaker,
    title: 'Real-Time Inventory',
    description: 'Monitor every blood unit by group, component and expiry with automated low-stock alerts.',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.2)',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Full Lab Screening',
    description: 'HIV, Hepatitis B/C, Malaria & Syphilis test tracking integrated directly into the workflow.',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.2)',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Emergency Requests',
    description: 'Hospitals submit urgent blood requests that get triaged and fulfilled in minutes, not hours.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.2)',
  },
  {
    icon: HiOutlineClipboardCheck,
    title: 'Appointment Booking',
    description: 'Donors can self-schedule donation appointments with automated confirmation notifications.',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Multi-Role Dashboards',
    description: 'Purpose-built views for Admins, Donors, Hospitals and Lab Staff — each in their lane.',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.2)',
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Home = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const { themeId, themes } = useTheme();

  // Emergency request states
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [branchId, setBranchId] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [medicalReport, setMedicalReport] = useState(null);
  const [governmentId, setGovernmentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    axios.get('/api/branches/public')
      .then(res => {
        if (res.data && res.data.data) {
          setBranches(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

  const handleMedicalReportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Medical report size must be less than 5MB');
        return;
      }
      setMedicalReport(file);
    }
  };

  const handleGovernmentIdChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ID proof size must be less than 5MB');
        return;
      }
      setGovernmentId(file);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !reason || !email || !contactName || !contactPhone || !branchId || !medicalReport || !governmentId) {
      return toast.error('Please fill in all fields and upload required documents');
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('patientName', patientName);
    formData.append('bloodGroup', bloodGroup);
    formData.append('quantity', quantity);
    formData.append('reason', reason);
    formData.append('branchId', branchId);
    formData.append('email', email);
    formData.append('emergencyContactName', contactName);
    formData.append('emergencyContactPhone', contactPhone);
    formData.append('medicalReport', medicalReport);
    formData.append('governmentId', governmentId);

    try {
      const res = await axios.post('/api/requests/public-emergency', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('🚨 Emergency request submitted successfully! Staff has been alerted.');
        setPatientName('');
        setReason('');
        setContactName('');
        setContactPhone('');
        setMedicalReport(null);
        setGovernmentId(null);
        setEmail('');
      } else {
        toast.error(res.data.message || 'Failed to submit request');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting emergency request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '5rem 1.5rem 4rem',
      }}>
        {/* Ambient blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '5%',
          width: '28rem', height: '28rem', borderRadius: '50%',
          background: 'var(--accent-glow)',
          filter: 'blur(80px)',
          animation: 'blob 8s infinite',
          pointerEvents: 'none',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '8%',
          width: '22rem', height: '22rem', borderRadius: '50%',
          background: 'var(--accent-soft)',
          filter: 'blur(60px)',
          animation: 'blob 10s infinite 3s',
          pointerEvents: 'none',
          opacity: 0.5,
        }} />

        {/* Floating blood group pills */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {BLOOD_GROUPS.map((g, i) => (
            <div
              key={g}
              style={{
                position: 'absolute',
                top: `${10 + (i * 11) % 80}%`,
                left: `${i % 2 === 0 ? (2 + i * 4) : (70 + i * 3)}%`,
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--accent)',
                fontSize: '0.72rem',
                fontWeight: 700,
                opacity: 0.35,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
              }}
            >
              {g}
            </div>
          ))}
        </div>

        {/* Hero content */}
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Theme badge */}
          <div
            className="animate-fadeUp"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem', borderRadius: '999px',
              background: 'var(--accent-soft)',
              border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
              marginBottom: '1.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{themes[themeId]?.emoji}</span>
            {themes[themeId]?.label} theme active · BBMS v2.0 is live
          </div>

          {/* Headline */}
          <h1
            className="animate-fadeUp delay-75"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Every Drop{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #fff))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Saves a Life
            </span>
            <br />
            Manage It Smarter
          </h1>

          <p
            className="animate-fadeUp delay-150"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '40rem',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            A modern Blood Bank Management System connecting donors, hospitals, and lab staff
            in real-time — from donation to transfusion, every step tracked.
          </p>

          {/* CTAs */}
          <div
            className="animate-fadeUp delay-300"
            style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {isAuthenticated ? (
              <Link
                to={`/${user?.role}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  background: 'var(--accent)', color: 'white',
                  borderRadius: '0.875rem', textDecoration: 'none',
                  fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 0 24px var(--accent-glow)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Go to Dashboard <HiOutlineArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.875rem 2rem',
                    background: 'var(--accent)', color: 'white',
                    borderRadius: '0.875rem', textDecoration: 'none',
                    fontWeight: 700, fontSize: '1rem',
                    boxShadow: '0 0 24px var(--accent-glow)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                >
                  Donate Blood <HiOutlineHeart />
                </Link>
                <Link
                  to="/inventory"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.875rem 2rem',
                    background: 'var(--bg-surface)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.875rem', textDecoration: 'none',
                    fontWeight: 600, fontSize: '1rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  Check Availability <HiOutlineBeaker />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══ STATS TICKER ════════════════════════════════ */}
      <section style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.5rem',
        }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`animate-fadeUp delay-${[75, 150, 300, 500][i]}`}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <p style={{
                fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent)',
                fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1,
              }}>
                {s.value}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.375rem', fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Everything You Need
            </p>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800,
              letterSpacing: '-0.025em', lineHeight: 1.2,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              A Complete Blood Bank Platform
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`animate-fadeUp delay-${[75, 150, 300, 500, 75, 150][i]}`}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.25rem',
                    padding: '1.75rem',
                    transition: 'all 0.25s ease',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = f.color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${f.glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* BG glow */}
                  <div style={{
                    position: 'absolute', top: '-2rem', right: '-2rem',
                    width: '6rem', height: '6rem', borderRadius: '50%',
                    background: f.glow, filter: 'blur(20px)', pointerEvents: 'none',
                  }} />
                  <div style={{
                    width: '2.75rem', height: '2.75rem',
                    borderRadius: '0.75rem',
                    background: `color-mix(in srgb, ${f.color} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${f.color} 35%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: `0 0 14px ${f.glow}`,
                  }}>
                    <Icon style={{ width: '1.3rem', height: '1.3rem', color: f.color }} />
                  </div>
                  <h3 style={{
                    color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem',
                    marginBottom: '0.5rem', position: 'relative',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65, position: 'relative' }}>
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ ROLES SECTION ═══════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
              letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Built for Every Role
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
              Each user gets a purpose-built dashboard tailored to their workflow.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { role: 'Admin',    emoji: '🛡️', desc: 'Full system oversight, user & inventory management',  color: '#a78bfa', link: '/register' },
              { role: 'Donor',    emoji: '❤️', desc: 'Track donations, book appointments, view history',    color: '#f87171', link: '/register' },
              { role: 'Hospital', emoji: '🏥', desc: 'Submit blood requests and check real-time inventory', color: '#34d399', link: '/register' },
              { role: 'Staff',    emoji: '🧪', desc: 'Manage collections, screening tests and storage',     color: '#60a5fa', link: '/register' },
            ].map(r => (
              <Link
                key={r.role}
                to={r.link}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  height: '100%',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = r.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px color-mix(in srgb, ${r.color} 20%, transparent)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{r.emoji}</div>
                  <h3 style={{ color: r.color, fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>{r.role}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EMERGENCY REQUEST SECTION ═════════════════════ */}
      <section style={{
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#ef4444'
            }}>
              🚨 CRITICAL NEED
            </div>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
              letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif"
            }}>
              Submit Emergency Request
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
              Submit an urgent request. Staff and nearby donors will be notified immediately.
            </p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <form onSubmit={handleEmergencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Patient Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Enter Patient Name"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                    }}
                  />
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter Email Address"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                {/* Blood Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg} style={{ background: 'var(--bg-elevated)' }}>{bg}</option>
                    ))}
                  </select>
                </div>
                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                </div>
                {/* Branch */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Target Branch</label>
                  <select
                    required
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  >
                    <option value="" style={{ background: 'var(--bg-elevated)' }}>Select Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id} style={{ background: 'var(--bg-elevated)' }}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Contact Person Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Emergency Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Contact Person Name"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                </div>
                {/* Contact Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Emergency Contact Phone</label>
                  <PhoneInput
                    country={'in'}
                    value={contactPhone}
                    onChange={setContactPhone}
                    inputStyle={{
                      width: '100%',
                      height: '42px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--input-radius)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                    buttonStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderTopLeftRadius: 'var(--input-radius)',
                      borderBottomLeftRadius: 'var(--input-radius)',
                    }}
                    dropdownStyle={{
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Reason for Urgency</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe the medical emergency..."
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              {/* File Upload Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Medical Report */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Medical Report (PDF/Image)</label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--input-radius)',
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      required
                      onChange={handleMedicalReportChange}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                      }}
                    />
                    {medicalReport ? (
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📄 {medicalReport.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {(medicalReport.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '1.25rem' }}>📤</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Click to upload Report</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Proof */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Government ID Proof (PDF/Image)</label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--input-radius)',
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      required
                      onChange={handleGovernmentIdChange}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                      }}
                    />
                    {governmentId ? (
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📄 {governmentId.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {(governmentId.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '1.25rem' }}>💳</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Click to upload ID Proof</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: 'var(--btn-radius)',
                  background: 'var(--accent)', color: 'white', fontWeight: 700,
                  fontSize: '1rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px var(--accent-glow)', transition: 'all 0.2s', marginTop: '0.5rem'
                }}
                onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.filter = 'brightness(1.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
              >
                {isSubmitting ? 'Submitting Urgent Request...' : '🚨 Send Emergency Broadcast'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ══════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--accent-soft)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            borderRadius: '1.5rem',
            padding: '3.5rem 2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-3rem', left: '50%', transform: 'translateX(-50%)',
              width: '16rem', height: '8rem', borderRadius: '50%',
              background: 'var(--accent-glow)', filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩸</div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800,
              marginBottom: '1rem', position: 'relative',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Ready to save lives?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto 2rem', lineHeight: 1.7, position: 'relative' }}>
              Join thousands of donors, hospitals and staff already using BBMS to make blood donation faster, safer and smarter.
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 2.5rem',
                background: 'var(--accent)', color: 'white',
                borderRadius: '0.875rem', textDecoration: 'none',
                fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 0 28px var(--accent-glow)',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
            >
              Get Started Free <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
