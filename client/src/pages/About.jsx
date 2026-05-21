import { HiOutlineHeart, HiOutlineBeaker, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '❤️',  title: 'Save Lives',         desc: 'Connect blood donors with hospitals and patients in need, ensuring timely and safe blood supply.' },
  { icon: '🧪',  title: 'Real-Time Inventory', desc: 'Monitor blood stock levels in real-time with automated low-stock alerts and expiry tracking.' },
  { icon: '🛡️',  title: 'Safe & Tested',       desc: 'Every unit is screened for HIV, Hepatitis B, Hepatitis C, Malaria, and Syphilis before distribution.' },
  { icon: '👥',  title: 'Multi-Role System',   desc: 'Purpose-built dashboards for Admins, Donors, Hospitals, and Lab Staff for seamless operations.' },
];

const STACK = ['React 19', 'Redux Toolkit', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth', 'TailwindCSS', 'Recharts'];

const STATS = [
  { value: '5000+', label: 'Blood Units Managed' },
  { value: '800+',  label: 'Registered Donors' },
  { value: '120+',  label: 'Partner Hospitals' },
  { value: '99.9%', label: 'Uptime' },
];

const About = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
    {/* Ambient blobs */}
    <div style={{ position: 'fixed', top: '10%', right: '5%', width: '24rem', height: '24rem', borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(90px)', opacity: 0.2, pointerEvents: 'none', zIndex: 0 }} />
    <div style={{ position: 'fixed', bottom: '15%', left: '5%', width: '20rem', height: '20rem', borderRadius: '50%', background: 'color-mix(in srgb, #60a5fa 40%, transparent)', filter: 'blur(80px)', opacity: 0.12, pointerEvents: 'none', zIndex: 0 }} />

    <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '4rem 1.5rem', position: 'relative', zIndex: 1 }} className="animate-fadeIn">

      {/* ── Hero ───────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          width: '4.5rem', height: '4.5rem', borderRadius: '1.25rem',
          background: 'var(--accent)', margin: '0 auto 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', boxShadow: '0 0 32px var(--accent-glow)',
        }}>
          🩸
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1, marginBottom: '1.25rem' }}>
          About{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--accent), #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BBMS
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '36rem', margin: '0 auto' }}>
          The Blood Bank Management System is a modern, full-stack web application designed to digitize and streamline blood bank operations — from donor registration to emergency blood distribution.
        </p>
      </div>

      {/* ── Stats row ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '1.25rem', padding: '1.5rem 1rem', textAlign: 'center',
            boxShadow: 'var(--card-shadow)',
          }}>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mission ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.03))',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: '1.5rem', padding: '2.5rem', textAlign: 'center', marginBottom: '3rem',
      }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.875rem' }}>
          🎯 Our Mission
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '36rem', margin: '0 auto' }}>
          To bridge the gap between blood donors and recipients through technology — reducing manual errors, improving emergency response times, and maintaining an accurate, always-available inventory of life-saving blood units.
        </p>
      </div>

      {/* ── Features ───────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif", textAlign: 'center', marginBottom: '1.5rem' }}>
          What We Do
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`animate-fadeUp delay-${['75','150','300','75'][i % 4]}`} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '1.25rem', padding: '1.5rem', transition: 'all 0.2s',
              boxShadow: 'var(--card-shadow)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 40%, transparent)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{f.icon}</div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech stack ─────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '1.25rem' }}>
          🛠 Built With
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
          {STACK.map(t => (
            <span key={t} style={{
              padding: '0.375rem 0.875rem',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '999px', color: 'var(--text-secondary)',
              fontSize: '0.82rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.5rem' }}>
          Ready to make a difference?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Join thousands of donors already saving lives.
        </p>
        <Link to="/register" style={{
          display: 'inline-block', padding: '0.75rem 2rem',
          background: 'var(--accent)', color: 'white',
          borderRadius: '0.875rem', textDecoration: 'none',
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 0 20px var(--accent-glow)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
        >
          🩸 Register as Donor
        </Link>
      </div>
    </div>
  </div>
);

export default About;
