import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, useInView } from 'framer-motion';
import {
  HiOutlineHeart, HiOutlineBeaker, HiOutlineShieldCheck,
  HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineGlobe, HiOutlineClipboardCheck, HiOutlineInformationCircle,
} from 'react-icons/hi';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiMapPin, FiAward } from 'react-icons/fi';
import AnimatedBackground from '../components/AnimatedBackground';
import ScrollReveal from '../components/ScrollReveal';
import BloodParticles from '../components/BloodParticles';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;

const STATS = [
  { value: '52,480', label: 'Lives Saved', icon: '❤️' },
  { value: '1,420', label: 'Active Donors', icon: '👤' },
  { value: '88', label: 'Hospital Partners', icon: '🏥' },
  { value: '99.99%', label: 'Request Fulfillment', icon: '⚡' },
];

const COMPATIBILITY_DATA = [
  { type: 'O-', gives: 'Everyone (Universal Donor)', receives: 'O-' },
  { type: 'O+', gives: 'O+, A+, B+, AB+', receives: 'O-, O+' },
  { type: 'A-', gives: 'A-, A+, AB-, AB+', receives: 'O-, A-' },
  { type: 'A+', gives: 'A+, AB+', receives: 'O-, O+, A-, A+' },
  { type: 'B-', gives: 'B-, B+, AB-, AB+', receives: 'O-, B-' },
  { type: 'B+', gives: 'B+, AB+', receives: 'O-, O+, B-, B+' },
  { type: 'AB-', gives: 'AB-, AB+', receives: 'O-, A-, B-, AB-' },
  { type: 'AB+', gives: 'AB+ (Universal Receiver)', receives: 'Everyone' },
];

const QUOTES = [
  { text: "“Donate blood, save lives. You do not need to be a doctor to save lives.”", author: "Anonymous" },
  { text: "“A single blood donation can save up to three lives. Every drop counts.”", author: "World Health Organization" },
  { text: "“Heroes don't always wear capes. Sometimes they just roll up their sleeves.”", author: "BBMS Inspiration" },
  { text: "“Your blood is precious. Share it to preserve the precious lives of others.”", author: "Solidarity Campaign" }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Helper to render compatibility groups as badges/subtitles
const renderCompatibilityBadges = (text) => {
  if (!text) return null;
  // If it's a list like "O+, A+, B+, AB+"
  if (text.includes(',')) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {text.split(',').map((group) => {
          const trimmed = group.trim();
          return (
            <span
              key={trimmed}
              className="blood-badge-cell"
              style={{
                display: 'inline-block',
                padding: '0.15rem 0.4rem',
                borderRadius: '0.25rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap',
              }}
            >
              {trimmed}
            </span>
          );
        })}
      </div>
    );
  }
  
  // If it has description like "AB+ (Universal Receiver)" or "Everyone (Universal Donor)"
  if (text.includes('(')) {
    const parts = text.split('(');
    const main = parts[0].trim();
    const sub = parts[1].replace(')', '').trim();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <span
          className="blood-badge-cell"
          style={{
            display: 'inline-block',
            padding: '0.15rem 0.4rem',
            borderRadius: '0.25rem',
            background: 'var(--accent-soft)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--accent)',
            fontSize: '0.72rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            width: 'fit-content',
          }}
        >
          {main}
        </span>
        <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          ({sub})
        </span>
      </div>
    );
  }

  // Single value (e.g. "O-", "Everyone")
  return (
    <span
      className="blood-badge-cell"
      style={{
        display: 'inline-block',
        padding: '0.15rem 0.4rem',
        borderRadius: '0.25rem',
        background: text.toLowerCase() === 'everyone' ? 'var(--accent-soft)' : 'var(--bg-surface)',
        border: text.toLowerCase() === 'everyone' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--glass-border)',
        color: text.toLowerCase() === 'everyone' ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: '0.72rem',
        fontWeight: text.toLowerCase() === 'everyone' ? 800 : 600,
        fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

const Home = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const { themeId, theme, themes } = useTheme();
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  // State hooks
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeEduTab, setActiveEduTab] = useState('can'); // 'can' | 'cannot'
  
  // Emergency request form states
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

  // Auto sliding quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch branches for emergency selection
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
      
      {/* ═══ HERO SECTION — Sui.io-inspired cinematic ══════════════ */}
      <section className="hero-section">
        {/* Premium animated background */}
        <AnimatedBackground variant="hero" />
        <BloodParticles />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }} />

        {/* Floating blood type elements */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {BLOOD_GROUPS.map((g, i) => (
            <motion.div
              key={g}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.35, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: `${12 + (i * 11) % 75}%`,
                left: `${i % 2 === 0 ? (4 + i * 4) : (75 + i * 3)}%`,
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                color: 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                animation: `float ${4 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
              }}
            >
              🩸 {g}
            </motion.div>
          ))}
        </div>

        <div style={{ maxWidth: '58rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1.25rem', borderRadius: '999px',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '2rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'glow-breathe 2s ease-in-out infinite' }} />
            <span>Live Platform · Real-Time Healthcare Network</span>
          </motion.div>

          {/* Core Title with staggered reveal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fluid-h1"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '1.75rem',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Empower Hope.<br />
            Every Drop{' '}
            <span style={{
              background: 'var(--gradient-text)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Saves Lives</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '38rem',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            A premium next-generation blood bank gateway connecting voluntary donors, 
            local branch clinics, and hospitals instantly during critical emergencies.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {isAuthenticated ? (
              <Link
                to={`/${user?.role}`}
                className="btn-primary"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 2.2rem', textDecoration: 'none',
                  fontSize: '0.95rem',
                }}
              >
                Enter Control Panel <HiOutlineArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.9rem 2.2rem', textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  Register to Donate <HiOutlineHeart />
                </Link>
                <a
                  href="#emergency-request-section"
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.9rem 2.2rem', textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  Emergency Request 🚨
                </a>
              </>
            )}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{
              position: 'absolute', bottom: '-3rem', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{
              width: '1px', height: '2rem',
              background: 'linear-gradient(180deg, var(--accent), transparent)',
              animation: 'slide-up-fade 1.5s ease-in-out infinite',
            }} />
          </motion.div>
        </div>
      </section>

      {/* ═══ LIVE STATS SECTION — Glassmorphism counter cards ════ */}
      <section ref={statsRef} style={{
        padding: '4rem 1.5rem',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
      }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.5rem',
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                textAlign: 'center',
                padding: '1.5rem 1rem',
                borderRadius: 'var(--card-radius)',
                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{s.icon}</div>
              <p style={{
                fontSize: '2.5rem', fontWeight: 900,
                fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {s.value}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ COMPATIBILITY CHART & EDUCATION ═══════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-base)', position: 'relative' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          
          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Grotesk', sans-serif" }}>Medical Guidelines</span>
              <h2 className="fluid-h2" style={{ fontWeight: 800, marginTop: '0.5rem' }}>Compatibility & Eligibility</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Learn who can donate, how blood types match, and clinical guidelines for safety.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="locator-container">
            {/* Table wrapper — glass */}
            <ScrollReveal direction="up" delay={0.1}>
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: 'var(--glass-shadow)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Who Can Donate Blood To Whom
              </h3>
              <div className="table-wrapper comp-table" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Blood Group</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Can Give Blood To (Recipients)</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Can Receive Blood From (Donors)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPATIBILITY_DATA.map((row) => (
                      <tr key={row.type} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '0.5rem',
                            background: 'var(--accent-soft)',
                            color: 'var(--accent)',
                            fontFamily: 'var(--font-display)',
                          }}>
                            {row.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {renderCompatibilityBadges(row.gives)}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {renderCompatibilityBadges(row.receives)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </ScrollReveal>

            {/* Educational Guidelines (Tabs) — glass */}
            <ScrollReveal direction="up" delay={0.2}>
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: 'var(--glass-shadow)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setActiveEduTab('can')}
                  className={activeEduTab === 'can' ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  🟢 Who Can Donate
                </button>
                <button
                  onClick={() => setActiveEduTab('cannot')}
                  className={activeEduTab === 'cannot' ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  🔴 Who Cannot Donate
                </button>
              </div>

              {activeEduTab === 'can' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fadeIn">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiCheckCircle style={{ color: '#4ade80', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Age Requirements</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Individuals between 18 and 65 years of age are generally eligible to donate.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiCheckCircle style={{ color: '#4ade80', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Weight Thresholds</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Must weigh at least 50 kg (110 lbs) and be in good general health at the time of donation.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiCheckCircle style={{ color: '#4ade80', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Interval Cooldowns</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Minimum of 90 days between consecutive Whole Blood donations to allow iron stores to fully replenish.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiCheckCircle style={{ color: '#4ade80', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vital Parameters</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Normal blood pressure (systolic 90-140, diastolic 60-90) and healthy hemoglobin levels (above 12.5 g/dl).</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fadeIn">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiAlertTriangle style={{ color: '#f87171', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Permanent Medical Restrictions</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Individuals with chronic viral infections (HIV, Hepatitis B or C), major heart diseases, insulin-dependent diabetes, or active cancers.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiAlertTriangle style={{ color: '#f87171', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Temporary Deferrals (Tattoos & Piercings)</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Recent tattoos, body piercings, or acupuncture procedures defer donation eligibility for 6 to 12 months for blood safety.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiAlertTriangle style={{ color: '#f87171', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Acute Infections & Medications</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Active colds, fever, sore throat, or recent course of antibiotics defer donation until symptoms completely resolve.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FiAlertTriangle style={{ color: '#f87171', width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pregnancy and Breastfeeding</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.15rem' }}>Deffered during pregnancy and up to 6 months post-delivery or while actively breastfeeding.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* ═══ DONATION PROCESS TIMELINE ═════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timeline</span>
            <h2 className="fluid-h2" style={{ fontWeight: 800, marginTop: '0.5rem' }}>The Donation Journey</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Your entire donation process is completed in five simple steps taking under 45 minutes.
            </p>
          </div>

          <div className="timeline">
            {[
              { step: '1', title: 'Registration', desc: 'Present photo identification, verify demographic profiles, and complete the donor health questionnaire.', alignment: 'left-timeline' },
              { step: '2', title: 'Screening', desc: 'A quick health assessment testing blood pressure, temperature, and checking hemoglobin levels from a finger-prick.', alignment: 'right-timeline' },
              { step: '3', title: 'Donation', desc: 'Relax in a donation chair. The actual draw takes around 8-10 minutes, collecting one unit (approx. 450ml) of whole blood.', alignment: 'left-timeline' },
              { step: '4', title: 'Recovery', desc: 'Rest in the refreshment area for 15 minutes while enjoying snacks and fluids to quickly restore hydration levels.', alignment: 'right-timeline' },
              { step: '5', title: 'Impact', desc: 'Your unit is safely transported, screened in our labs, componentized, and sent to hospitals to save up to 3 lives!', alignment: 'left-timeline' }
            ].map((t, idx) => (
              <div key={idx} className={`timeline-item ${t.alignment}`}>
                <div className="timeline-content">
                  <div style={{
                    position: 'absolute', top: '-1rem', left: idx % 2 === 0 ? '-1rem' : 'auto', right: idx % 2 !== 0 ? '-1rem' : 'auto',
                    width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 800,
                    boxShadow: '0 0 10px var(--accent-glow)'
                  }}>
                    {t.step}
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', marginTop: '0.25rem' }}>{t.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MOTIVATIONAL QUOTES SLIDER ════════════════════ */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient background decoration */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '20rem', height: '8rem', borderRadius: '50%', background: 'var(--accent-soft)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '42rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FiAward style={{ fontSize: '2.5rem', color: 'var(--accent)', margin: '0 auto 1.5rem', animation: 'float 3s ease-in-out infinite' }} />
          
          <div style={{ minHeight: '8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="quote-card animate-fadeIn" key={currentQuote}>
              <p style={{
                fontSize: 'clamp(1.2rem, 3.5vw, 1.65rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                lineHeight: 1.6,
                fontFamily: 'var(--font-body)',
              }}>
                {QUOTES[currentQuote].text}
              </p>
              <p style={{
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginTop: '1.25rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
              }}>
                — {QUOTES[currentQuote].author}
              </p>
            </div>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {QUOTES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuote(idx)}
                aria-label={`Show quote ${idx + 1}`}
                style={{
                  width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                  background: currentQuote === idx ? 'var(--accent)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EMERGENCY REQUEST FORM SECTION ════════════════ */}
      <section id="emergency-request-section" style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '50rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.85rem', borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1rem', fontSize: '0.78rem', fontWeight: 700, color: '#ef4444'
            }}>
              🚨 URGENT BROADCAST SYSTEM
            </span>
            <h2 className="fluid-h2" style={{ fontWeight: 800 }}>Submit Emergency Request</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              In need of immediate blood units? Submit a verified emergency request to alert nearby branches and active staff.
            </p>
          </div>

          {/* Form wrapper */}
          <div className="glass-premium" style={{
            borderRadius: '1.75rem',
            padding: '2.5rem',
            boxShadow: 'var(--card-shadow)',
          }}>
            <form onSubmit={handleEmergencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {/* Patient Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="input"
                    style={{ padding: '0.75rem' }}
                  />
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter notification email"
                    className="input"
                    style={{ padding: '0.75rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.25rem' }}>
                {/* Blood Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Required Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="input"
                    style={{ padding: '0.75rem', cursor: 'pointer' }}
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg} style={{ background: 'var(--bg-surface)' }}>{bg}</option>
                    ))}
                  </select>
                </div>
                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="input"
                    style={{ padding: '0.75rem' }}
                  />
                </div>
                {/* Branch Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Branch</label>
                  <select
                    required
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="input"
                    style={{ padding: '0.75rem', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>Select Nearest Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id} style={{ background: 'var(--bg-surface)' }}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {/* Contact Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Contact person name"
                    className="input"
                    style={{ padding: '0.75rem' }}
                  />
                </div>
                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact Phone Number</label>
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reason for Urgency</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe details of the surgical / clinical emergency (e.g. bypass, trauma response, low platelets)..."
                  className="input"
                  style={{ padding: '0.75rem', resize: 'none' }}
                />
              </div>

              {/* Verified Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {/* Medical Report */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Medical Request Report</label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--input-radius)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
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
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
                          📄 {medicalReport.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {(medicalReport.size / 1024 / 1024).toFixed(2)} MB (Ready)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '1.5rem' }}>📤</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Upload doctor requisition form</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Proof */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patient ID / Proof</label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--input-radius)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
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
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
                          💳 {governmentId.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {(governmentId.size / 1024 / 1024).toFixed(2)} MB (Ready)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '1.5rem' }}>💳</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Upload Patient ID document</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.9rem',
                  fontSize: '1rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                {isSubmitting ? 'Submitting Urgent Request...' : '🚨 Broadcast Emergency SOS Request'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ NEARBY CAMPS & CLINICS SECTION ════════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Locations</span>
            <h2 className="fluid-h2" style={{ fontWeight: 800, marginTop: '0.5rem' }}>Our Branches & Donation Camps</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Find active branches and blood bank camps near your city for quick voluntary donation walk-ins.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {branches.slice(0, 3).map(b => (
              <div
                key={b._id}
                className="glass-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '1.25rem',
                  padding: '1.75rem',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏥</span>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{b.name}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {b.address?.street}, {b.address?.city || b.city}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  📞 {b.phone || 'N/A'} &nbsp;·&nbsp; ✉️ {b.email || 'N/A'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Link
                    to={`/locator`}
                    className="btn-ghost"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', textDecoration: 'none', width: '100%', textAlign: 'center' }}
                  >
                    View Map Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              to="/locator"
              className="btn-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 2rem', textDecoration: 'none', fontSize: '0.875rem'
              }}
            >
              Search All Branches On Map <HiOutlineGlobe />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ══════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-premium" style={{
            borderRadius: '1.75rem',
            padding: '4rem 2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🩸</div>
            <h2 className="fluid-h2" style={{ fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
              Join the Life-Saving Network
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              Become a verified blood donor, schedule your screening appointments, check real-time stock levels, or manage branch inventory from a single premium control room.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '0.875rem 2.5rem', textDecoration: 'none', fontWeight: 700 }}
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="btn-ghost"
                style={{ padding: '0.875rem 2.5rem', textDecoration: 'none', fontWeight: 700 }}
              >
                Account Log In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
