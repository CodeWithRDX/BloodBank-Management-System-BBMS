import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, useInView } from 'framer-motion';
import {
  HiOutlineHeart,
  HiOutlineUserGroup, HiOutlineArrowRight,
  HiOutlineGlobe,
} from 'react-icons/hi';
import { FiAlertTriangle, FiCheckCircle, FiMapPin, FiAward } from 'react-icons/fi';
import AnimatedBackground from '../components/AnimatedBackground';
import ScrollReveal from '../components/ScrollReveal';
import BloodParticles from '../components/BloodParticles';
import './Home.css';

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

// ── PHONE INPUT STYLING DEFINITION ──
const PHONE_INPUT_PROPS = {
  inputStyle: {
    width: '100%',
    height: '42px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--input-radius)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
  },
  buttonStyle: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderTopLeftRadius: 'var(--input-radius)',
    borderBottomLeftRadius: 'var(--input-radius)',
  },
  dropdownStyle: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  }
};


const Home = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  // State hooks
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeEduTab, setActiveEduTab] = useState('can'); // 'can' | 'cannot'
  const customEase = [0.16, 1, 0.3, 1];

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
    <div className="neural-container">
      
      {/* ═══ HERO SECTION — Split Column layout with 3D glass blood droplet ══════════════ */}
      <section className="hero-section">
        {/* Premium animated background */}
        <AnimatedBackground variant="hero" />
        <BloodParticles />

        {/* Grid pattern overlay */}
        <div className="hero-grid-pattern" />

        {/* Floating blood type elements */}
        <div className="floating-bg-badges-container">
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

        <div className="hero-grid-container">
          
          {/* Left Column: Hero Content */}
          <div className="hero-left-content">
            {/* Header Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: customEase }}
              className="hero-header-badge"
            >
              <span className="hero-header-badge-dot" />
              <span>Live Platform · Real-Time Healthcare Network</span>
            </motion.div>

            {/* Core Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: customEase }}
              className="hero-main-title"
            >
              Saving Lives<br />
              Through Smarter{' '}
              <span className="hero-gradient-span">Blood Management</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hero-main-desc"
            >
              A premium next-generation blood bank gateway connecting voluntary donors, 
              local branch clinics, and hospitals instantly during critical emergencies.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="hero-action-ctas"
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

            {/* Trust Badges */}
            <div className="hero-trust-badges">
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ Clinical Safety Grade</span>
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ WHO Compliant</span>
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ FDA Standards</span>
            </div>

            {/* Live Metrics Grid restored from original counter cards */}
            <div className="hero-stats-grid">
              <div className="hero-stat-card">
                <p className="hero-stat-val" style={{ color: 'var(--accent)' }}>52,480</p>
                <p className="hero-stat-lbl">Lives Saved</p>
              </div>
              <div className="hero-stat-card">
                <p className="hero-stat-val" style={{ color: 'var(--accent-secondary)' }}>1,420</p>
                <p className="hero-stat-lbl">Active Donors</p>
              </div>
              <div className="hero-stat-card">
                <p className="hero-stat-val" style={{ color: 'var(--accent-success)' }}>88</p>
                <p className="hero-stat-lbl">Hospitals Connected</p>
              </div>
              <div className="hero-stat-card">
                <p className="hero-stat-val" style={{ color: 'var(--accent-warning)' }}>99.99%</p>
                <p className="hero-stat-lbl">Fulfillment Rate</p>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Animated 3D Glass Droplet Visualizer */}
          <div className="hero-right-visual">
            {/* Concentric glowing pulse rings */}
            <motion.div
              className="droplet-pulse-ring"
              animate={{ scale: [0.75, 1.4], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
            />

            {/* DNA curved helix lines */}
            <svg className="dna-curve" viewBox="0 0 100 200">
              <path d="M10,10 Q90,50 10,100 T90,190" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M90,10 Q10,50 90,100 T10,190" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Floating red blood cells */}
            <motion.div
              className="floating-cell"
              style={{ top: '20px', left: '20px' }}
              animate={{ y: [0, -12, 0], x: [0, 5, 0], rotate: [0, 45, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 40 40" width="30" height="30">
                <radialGradient id="rbc1" cx="35%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ff7b7b" />
                  <stop offset="70%" stopColor="#d32f2f" />
                  <stop offset="100%" stopColor="#5f0909" />
                </radialGradient>
                <circle cx="20" cy="20" r="16" fill="url(#rbc1)" />
                <circle cx="20" cy="20" r="5" fill="#7f1d1d" opacity="0.25" />
              </svg>
            </motion.div>

            <motion.div
              className="floating-cell"
              style={{ bottom: '30px', right: '30px' }}
              animate={{ y: [0, 10, 0], x: [0, -5, 0], rotate: [0, -30, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 40 40" width="34" height="34">
                <radialGradient id="rbc2" cx="35%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ff7b7b" />
                  <stop offset="70%" stopColor="#d32f2f" />
                  <stop offset="100%" stopColor="#5f0909" />
                </radialGradient>
                <circle cx="20" cy="20" r="16" fill="url(#rbc2)" />
                <circle cx="20" cy="20" r="5" fill="#7f1d1d" opacity="0.25" />
              </svg>
            </motion.div>

            <motion.div
              className="floating-cell blur-cell"
              style={{ top: '150px', right: '15px' }}
              animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 40 40" width="22" height="22">
                <radialGradient id="rbc3" cx="35%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ff7b7b" />
                  <stop offset="70%" stopColor="#d32f2f" />
                  <stop offset="100%" stopColor="#5f0909" />
                </radialGradient>
                <circle cx="20" cy="20" r="16" fill="url(#rbc3)" />
              </svg>
            </motion.div>

            {/* Droplet container */}
            <motion.div
              className="droplet-container"
              animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 200 200" width="220" height="220" style={{ filter: 'drop-shadow(0 15px 35px rgba(229,57,53,0.38))' }}>
                <defs>
                  <radialGradient id="dropletGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff5252" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#e53935" stopOpacity="0.9" />
                    <stop offset="85%" stopColor="#b71c1c" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4a0000" stopOpacity="0.98" />
                  </radialGradient>
                  <linearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Blood Drop path */}
                <path d="M100,20 Q160,115 160,150 A60,60 0 1,1 40,150 Q40,115 100,20 Z" fill="url(#dropletGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                
                {/* Glass surface curves */}
                <path d="M72,48 Q130,122 130,150" fill="none" stroke="url(#glossGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
                <ellipse cx="85" cy="72" rx="9" ry="14" transform="rotate(-30, 85, 72)" fill="url(#glossGrad)" opacity="0.75" />
                
                {/* Glowing medical plus (+) symbol inside */}
                <g transform="translate(100, 142)" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' }}>
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </svg>
            </motion.div>
          </div>

        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="hero-scroll-indicator"
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: '1px', height: '2rem',
            background: 'linear-gradient(180deg, var(--accent), transparent)',
            animation: 'slide-up-fade 1.5s ease-in-out infinite',
          }} />
        </motion.div>
      </section>

      {/* ═══ COMPATIBILITY CHART & EDUCATION ═══════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-base)', position: 'relative', zIndex: 2 }}>
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

          {/* Changed class name to compatibility-grid-container to prevent full-screen visibility clipping */}
          <div className="compatibility-grid-container">
            
            {/* Table wrapper — glass */}
            <ScrollReveal direction="up" delay={0.1}>
            <div className="comp-glass-card">
              <h3 className="comp-card-title">
                📊 Who Can Donate Blood To Whom
              </h3>
              <div className="table-wrapper comp-table comp-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Can Give Blood To (Recipients)</th>
                      <th>Can Receive Blood From (Donors)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPATIBILITY_DATA.map((row) => (
                      <tr key={row.type}>
                        <td>
                          <span className="comp-badge-type">
                            {row.type}
                          </span>
                        </td>
                        <td className="comp-gives-cell">
                          {renderCompatibilityBadges(row.gives)}
                        </td>
                        <td className="comp-receives-cell">
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
            <div className="comp-glass-card edu-glass-card">
              <div className="edu-tabs-header">
                <button
                  onClick={() => setActiveEduTab('can')}
                  className={`${activeEduTab === 'can' ? 'btn-primary' : 'btn-ghost'} edu-tab-btn`}
                >
                  🟢 Who Can Donate
                </button>
                <button
                  onClick={() => setActiveEduTab('cannot')}
                  className={`${activeEduTab === 'cannot' ? 'btn-primary' : 'btn-ghost'} edu-tab-btn`}
                >
                  🔴 Who Cannot Donate
                </button>
              </div>

              {activeEduTab === 'can' ? (
                <div className="edu-tab-content animate-fadeIn">
                  <div className="edu-info-row">
                    <FiCheckCircle className="edu-icon-check" />
                    <div>
                      <p className="edu-row-title">Age Requirements</p>
                      <p className="edu-row-desc">Individuals between 18 and 65 years of age are generally eligible to donate.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiCheckCircle className="edu-icon-check" />
                    <div>
                      <p className="edu-row-title">Weight Thresholds</p>
                      <p className="edu-row-desc">Must weigh at least 50 kg (110 lbs) and be in good general health at the time of donation.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiCheckCircle className="edu-icon-check" />
                    <div>
                      <p className="edu-row-title">Interval Cooldowns</p>
                      <p className="edu-row-desc">Minimum of 90 days between consecutive Whole Blood donations to allow iron stores to fully replenish.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiCheckCircle className="edu-icon-check" />
                    <div>
                      <p className="edu-row-title">Vital Parameters</p>
                      <p className="edu-row-desc">Normal blood pressure (systolic 90-140, diastolic 60-90) and healthy hemoglobin levels (above 12.5 g/dl).</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edu-tab-content animate-fadeIn">
                  <div className="edu-info-row">
                    <FiAlertTriangle className="edu-icon-alert" />
                    <div>
                      <p className="edu-row-title">Permanent Medical Restrictions</p>
                      <p className="edu-row-desc">Individuals with chronic viral infections (HIV, Hepatitis B or C), major heart diseases, insulin-dependent diabetes, or active cancers.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiAlertTriangle className="edu-icon-alert" />
                    <div>
                      <p className="edu-row-title">Temporary Deferrals (Tattoos & Piercings)</p>
                      <p className="edu-row-desc">Recent tattoos, body piercings, or acupuncture procedures defer donation eligibility for 6 to 12 months for blood safety.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiAlertTriangle className="edu-icon-alert" />
                    <div>
                      <p className="edu-row-title">Acute Infections & Medications</p>
                      <p className="edu-row-desc">Active colds, fever, sore throat, or recent course of antibiotics defer donation until symptoms completely resolve.</p>
                    </div>
                  </div>
                  <div className="edu-info-row">
                    <FiAlertTriangle className="edu-icon-alert" />
                    <div>
                      <p className="edu-row-title">Pregnancy and Breastfeeding</p>
                      <p className="edu-row-desc">Deffered during pregnancy and up to 6 months post-delivery or while actively breastfeeding.</p>
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
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-header">
            <span className="timeline-subtitle">Timeline</span>
            <h2 className="fluid-h2">The Donation Journey</h2>
            <p>
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
                  <div 
                    className="timeline-badge"
                    style={{
                      left: idx % 2 === 0 ? '-1rem' : 'auto', 
                      right: idx % 2 !== 0 ? '-1rem' : 'auto'
                    }}
                  >
                    {t.step}
                  </div>
                  <h4 className="timeline-item-title">{t.title}</h4>
                  <p className="timeline-item-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MOTIVATIONAL QUOTES SLIDER ════════════════════ */}
      <section className="quotes-section">
        <div className="quotes-ambient-glow" />
        
        <div className="quotes-container">
          <FiAward className="quotes-icon" />
          
          <div className="quotes-slider-box">
            <div className="quote-card animate-fadeIn" key={currentQuote}>
              <p className="quote-text">
                {QUOTES[currentQuote].text}
              </p>
              <p className="quote-author">
                — {QUOTES[currentQuote].author}
              </p>
            </div>
          </div>

          <div className="quote-dots-container">
            {QUOTES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuote(idx)}
                aria-label={`Show quote ${idx + 1}`}
                className="quote-dot"
                style={{
                  background: currentQuote === idx ? 'var(--accent)' : 'var(--border)'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EMERGENCY REQUEST FORM SECTION ════════════════ */}
      <section id="emergency-request-section" className="emergency-section">
        <div className="emergency-container">
          <div className="emergency-header">
            <span className="emergency-badge">
              🚨 URGENT BROADCAST SYSTEM
            </span>
            <h2 className="fluid-h2">Submit Emergency Request</h2>
            <p>
              In need of immediate blood units? Submit a verified emergency request to alert nearby branches and active staff.
            </p>
          </div>

          <div className="glass-premium emergency-form-card">
            <form onSubmit={handleEmergencySubmit} className="emergency-form">
              
              <div className="form-grid-row">
                <div>
                  <label>Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="input"
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter notification email"
                    className="input"
                  />
                </div>
              </div>

              <div className="form-grid-row-three">
                <div>
                  <label>Required Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="input"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                </div>
                <div>
                  <label>Target Branch</label>
                  <select
                    required
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="input"
                  >
                    <option value="">Select Nearest Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-row">
                <div>
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Contact person name"
                    className="input"
                  />
                </div>
                <div>
                  <label>Contact Phone Number</label>
                  <PhoneInput
                    country={'in'}
                    value={contactPhone}
                    onChange={setContactPhone}
                    {...PHONE_INPUT_PROPS}
                  />
                </div>
              </div>

              <div>
                <label>Reason for Urgency</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe details of the surgical / clinical emergency (e.g. bypass, trauma response, low platelets)..."
                  className="input"
                />
              </div>

              <div className="form-grid-row">
                <div>
                  <label>Medical Request Report</label>
                  <div className="file-dropzone">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      required
                      onChange={handleMedicalReportChange}
                      className="file-input-hidden"
                    />
                    {medicalReport ? (
                      <div>
                        <p className="file-name-text">
                          📄 {medicalReport.name}
                        </p>
                        <p className="file-size-text">
                          {(medicalReport.size / 1024 / 1024).toFixed(2)} MB (Ready)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="file-icon">📤</span>
                        <p className="file-label-text">Upload doctor requisition form</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label>Patient ID / Proof</label>
                  <div className="file-dropzone">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      required
                      onChange={handleGovernmentIdChange}
                      className="file-input-hidden"
                    />
                    {governmentId ? (
                      <div>
                        <p className="file-name-text">
                          💳 {governmentId.name}
                        </p>
                        <p className="file-size-text">
                          {(governmentId.size / 1024 / 1024).toFixed(2)} MB (Ready)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="file-icon">💳</span>
                        <p className="file-label-text">Upload Patient ID document</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary form-submit-btn"
              >
                {isSubmitting ? 'Submitting Urgent Request...' : '🚨 Broadcast Emergency SOS Request'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ NEARBY CAMPS & CLINICS SECTION ════════════════ */}
      <section className="camps-section">
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Locations</span>
            <h2 className="fluid-h2" style={{ fontWeight: 800, marginTop: '0.5rem' }}>Our Branches & Donation Camps</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Find active branches and blood bank camps near your city for quick voluntary donation walk-ins.
            </p>
          </div>

          <div className="camps-grid">
            {branches.slice(0, 3).map(b => (
              <div
                key={b._id}
                className="glass-card camp-card"
              >
                <div className="camp-card-header">
                  <span className="camp-card-icon">🏥</span>
                  <h3>{b.name}</h3>
                </div>
                <p className="camp-card-address">
                  <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {b.address?.street}, {b.address?.city || b.city}
                </p>
                <p className="camp-card-contact">
                  📞 {b.phone || 'N/A'} &nbsp;·&nbsp; ✉️ {b.email || 'N/A'}
                </p>
                <div className="camp-card-actions">
                  <Link
                    to={`/locator`}
                    className="btn-ghost camp-card-btn"
                  >
                    View Map Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="camps-footer-actions">
            <Link
              to="/locator"
              className="btn-primary camps-search-btn"
            >
              Search All Branches On Map <HiOutlineGlobe />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ══════════════════════════════════ */}
      <section className="cta-section">
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-premium cta-premium-card">
            <div className="cta-icon-box">🩸</div>
            <h2>
              Join the Life-Saving Network
            </h2>
            <p>
              Become a verified blood donor, schedule your screening appointments, check real-time stock levels, or manage branch inventory from a single premium control room.
            </p>
            <div className="cta-actions-group">
              <Link
                to="/register"
                className="btn-primary cta-action-btn"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="btn-ghost cta-action-btn"
              >
                Account Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLID BOTTOM TAGS BLOCK ── */}
      <div className="hero-tags-footer-block">
        <div className="hero-tags-footer-inner">
          <div className="footer-right">
            <div className="pill-tag">Real-time Supply</div>
            <div className="pill-tag">Emergency Care</div>
            <div className="pill-tag">Safe Logistics</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
