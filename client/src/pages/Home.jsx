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
import ScrollReveal from '../components/ScrollReveal';
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
};

const TIMELINE_STEPS = [
  { step: '01', title: 'Registration', desc: 'Present photo identification, verify demographic profiles, and complete the donor health questionnaire.' },
  { step: '02', title: 'Screening', desc: 'A quick health assessment testing blood pressure, temperature, and checking hemoglobin levels from a finger-prick.' },
  { step: '03', title: 'Donation', desc: 'Relax in a donation chair. The actual draw takes around 8-10 minutes, collecting one unit (approx. 450ml) of whole blood.' },
  { step: '04', title: 'Recovery', desc: 'Rest in the refreshment area for 15 minutes while enjoying snacks and fluids to quickly restore hydration levels.' },
  { step: '05', title: 'Impact', desc: 'Your unit is safely transported, screened in our labs, componentized, and sent to hospitals to save up to 3 lives!' }
];

const renderTimelineIllustration = (idx) => {
  switch(idx) {
    case 0:
      return (
        <div className="timeline-illustration-container">
          <div className="reg-badge-widget">
            <div className="reg-avatar-row">
              <div className="reg-avatar">RD</div>
              <div className="reg-avatar-meta">
                <span className="reg-name">Raushan Kumar</span>
                <span className="reg-badge-state">Verified Donor</span>
              </div>
            </div>
            <div className="reg-checklist">
              <div className="reg-check-item done">
                <span style={{ color: 'var(--accent-success)', marginRight: '8px', fontWeight: 800 }}>✓</span> Photo ID Verified
              </div>
              <div className="reg-check-item done">
                <span style={{ color: 'var(--accent-success)', marginRight: '8px', fontWeight: 800 }}>✓</span> Health Profile Match
              </div>
              <div className="reg-check-item done">
                <span style={{ color: 'var(--accent-success)', marginRight: '8px', fontWeight: 800 }}>✓</span> Digital Questionnaire
              </div>
            </div>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="timeline-illustration-container">
          <div className="vitals-monitor-widget">
            <div className="vitals-header-row">
              <span className="vitals-lbl">LIVE SCREENING</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-success)' }}></span>
            </div>
            <div className="vitals-grid">
              <div className="vitals-box">
                <span className="v-val" style={{ color: 'var(--accent-success)' }}>120/80</span>
                <span className="v-unit">BP (mmHg)</span>
              </div>
              <div className="vitals-box">
                <span className="v-val" style={{ color: 'var(--accent-success)' }}>98.6°</span>
                <span className="v-unit">TEMP (F)</span>
              </div>
              <div className="vitals-box">
                <span className="v-val" style={{ color: 'var(--accent-success)' }}>14.2</span>
                <span className="v-unit">HEMOGLOBIN</span>
              </div>
            </div>
            <svg className="ekg-line-svg" viewBox="0 0 300 50">
              <path 
                className="ekg-pulse-wave"
                d="M 0,25 L 30,25 L 40,25 L 45,5 L 50,45 L 55,20 L 60,25 L 80,25 L 120,25 L 130,25 L 135,5 L 140,45 L 145,20 L 150,25 L 200,25 L 230,25 L 240,25 L 245,5 L 250,45 L 255,20 L 260,25 L 300,25" 
              />
            </svg>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="timeline-illustration-container">
          <div className="donation-droplet-glow">
            <div style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }} />
            <svg 
              width="110" 
              height="150" 
              viewBox="0 0 100 130"
              style={{ filter: 'drop-shadow(0px 8px 24px rgba(239, 68, 68, 0.35))' }}
            >
              <defs>
                <linearGradient id="dropletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path 
                d="M 50,5 C 50,5 95,65 95,90 C 95,115 75,130 50,130 C 25,130 5,115 5,90 C 5,65 50,5 50,5 Z" 
                fill="url(#dropletGrad)" 
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
              />
              <path 
                d="M 43,80 H 57 M 50,73 V 87" 
                stroke="rgba(255,255,255,0.7)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="timeline-illustration-container">
          <div className="recovery-cup-widget" style={{ width: '280px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>🥤</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>15 Min Rest Area</span>
              <div style={{ width: '100%', background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'var(--accent)' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>Restoring hydration levels with snacks and fluids.</p>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="timeline-illustration-container">
          <div className="transfusion-widget">
            <div className="trans-live-row">
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>TRANSFUSION DISPATCH</span>
              <span className="lives-saved-badge">Active SOS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '2.5rem' }}>🩸</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>3 Lives</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>Saved Per Unit</span>
              </div>
            </div>
            <div className="trans-progress-container">
              <span className="trans-progress-lbl">Delivery Progress · Complete</span>
              <div style={{ width: '100%', background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'var(--accent)' }} />
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const Home = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);

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
        {/* Grid pattern overlay */}
        <div className="hero-grid-pattern" />

        <div className="hero-grid-container">
          
          {/* Left Column: Hero Content */}
          <div className="hero-left-content">
            {/* Header Badge */}
            <div className="hero-header-badge">
              <span className="hero-header-badge-dot" />
              <span>Live Platform · Real-Time Healthcare Network</span>
            </div>

            {/* Core Title */}
            <h1 className="hero-main-title">
              Saving Lives<br />
              Through Smarter{' '}
              <span className="hero-gradient-span">Blood Management</span>.
            </h1>

            <p className="hero-main-desc">
              A premium next-generation blood bank gateway connecting voluntary donors, 
              local branch clinics, and hospitals instantly during critical emergencies.
            </p>

            {/* Action CTAs */}
            <div className="hero-action-ctas">
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
            </div>

            {/* Trust Badges */}
            <div className="hero-trust-badges">
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ Clinical Safety Grade</span>
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ WHO Compliant</span>
              <span className="pill-tag" style={{ fontSize: '10px' }}>✓ FDA Standards</span>
            </div>

            {/* Quick Blood Group Stock Navigator */}
            <div className="hero-blood-groups-strip">
              <span className="hero-strip-label">Quick Blood Stock:</span>
              <div className="hero-strip-chips">
                {BLOOD_GROUPS.map((g) => (
                  <Link to="/inventory" key={g} className="hero-chip-badge" title={`Check stock for ${g}`}>
                    {g}
                  </Link>
                ))}
              </div>
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

          {/* Right Column: Premium 3D Glass Droplet Visualizer */}
          <div className="hero-right-visual">
            {/* Concentric glowing pulse ring - CSS subtle */}
            <div className="droplet-pulse-ring" />

            {/* DNA curved helix lines */}
            <svg className="dna-curve" viewBox="0 0 100 200">
              <path d="M10,10 Q90,50 10,100 T90,190" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M90,10 Q10,50 90,100 T10,190" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Droplet container */}
            <div className="droplet-container hero-droplet-card">
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
            </div>
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

      {/* ═══ DONATION PROCESS TIMELINE — Lightweight Stepped Journey ═════════════════════ */}
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-header">
            <span className="timeline-subtitle">Clinical Process</span>
            <h2 className="fluid-h2">The Donation Journey</h2>
            <p>
              Track every stage of blood donation—from initial registration to patient transfusion—in an intuitive step-by-step walkthrough.
            </p>
          </div>

          <div className="journey-stepper-container">
            {/* Step Selector Tabs */}
            <div className="journey-step-tabs">
              {TIMELINE_STEPS.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(idx)}
                    className={`journey-step-tab-btn ${isActive ? 'active' : ''}`}
                    aria-label={`View Step ${s.step}: ${s.title}`}
                  >
                    <span className="journey-tab-num">{s.step}</span>
                    <span className="journey-tab-title">{s.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Card */}
            <div className="journey-card-display glass-premium">
              <div className="journey-card-left">
                <div className="journey-step-pill">
                  Stage {TIMELINE_STEPS[activeStep].step} of 05
                </div>
                <h3 className="journey-card-title">{TIMELINE_STEPS[activeStep].title}</h3>
                <p className="journey-card-desc">{TIMELINE_STEPS[activeStep].desc}</p>
                
                <div className="journey-card-actions">
                  <Link to="/register" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                    Schedule Donation →
                  </Link>
                  <div className="journey-nav-buttons">
                    <button
                      onClick={() => setActiveStep(prev => (prev > 0 ? prev - 1 : TIMELINE_STEPS.length - 1))}
                      className="btn-ghost journey-nav-btn"
                      title="Previous Step"
                      aria-label="Previous Step"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setActiveStep(prev => (prev < TIMELINE_STEPS.length - 1 ? prev + 1 : 0))}
                      className="btn-ghost journey-nav-btn"
                      title="Next Step"
                      aria-label="Next Step"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              <div className="journey-card-right">
                {renderTimelineIllustration(activeStep)}
              </div>
            </div>
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
