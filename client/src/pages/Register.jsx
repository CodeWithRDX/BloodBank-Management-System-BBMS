import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineUser,
  HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight
} from 'react-icons/hi';

const ROLES = [
  { id: 'donor',    label: 'Blood Donor',     emoji: '❤️',  desc: 'Donate & track history'    },
  { id: 'hospital', label: 'Hospital/Clinic',  emoji: '🏥',  desc: 'Request & manage supply'   },
];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'donor' });
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState(1); // 2-step form
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && user) navigate(`/${user.role}`);
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [isAuthenticated, user, error, navigate, dispatch]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error('Fill all fields');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    const { confirmPassword, ...data } = form;
    dispatch(registerUser(data));
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.875rem 0.75rem 2.5rem',
    fontSize: '0.9rem',
  };

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
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '20%', right: '5%', width: '18rem', height: '18rem', borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(70px)', opacity: 0.35, pointerEvents: 'none', animation: 'blob 9s infinite' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '15rem', height: '15rem', borderRadius: '50%', background: 'var(--accent-soft)', filter: 'blur(55px)', opacity: 0.4, pointerEvents: 'none' }} />

      <div className="animate-scaleIn" style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '3.25rem', height: '3.25rem', borderRadius: '1rem',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem', boxShadow: '0 0 24px var(--accent-glow)', fontSize: '1.4rem',
          }}>
            🩸
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.65rem', letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Create account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Join BBMS — it's free & takes 60 seconds
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: s === 1 ? 1 : 0 }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                background: step >= s ? 'var(--accent)' : 'var(--bg-elevated)',
                border: `1px solid ${step >= s ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                color: step >= s ? 'white' : 'var(--text-secondary)',
                boxShadow: step >= s ? '0 0 10px var(--accent-glow)' : 'none',
                transition: 'all 0.3s',
              }}>
                {s}
              </div>
              <span style={{ fontSize: '0.75rem', color: step >= s ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: step >= s ? 600 : 400, whiteSpace: 'nowrap' }}>
                {s === 1 ? 'Your Info' : 'Set Password'}
              </span>
              {s === 1 && <div style={{ flex: 1, height: '1px', background: step >= 2 ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s', marginLeft: '0.5rem' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: 'var(--card-shadow)',
        }}>
          {step === 1 ? (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Role selector */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Account Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.id })}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.875rem',
                        border: `1px solid ${form.role === r.id ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.role === r.id ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.25rem' }}>{r.emoji}</span>
                      <span style={{ color: form.role === r.id ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', display: 'block' }}>{r.label}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                  {form.role === 'hospital' ? 'Hospital Name' : 'Full Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineUser style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input type="text" name="name" required placeholder={form.role === 'hospital' ? 'City General Hospital' : 'Raushan Kumar'} value={form.name} onChange={handleChange} className="input" style={inputStyle} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} className="input" style={inputStyle} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <HiOutlinePhone style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input type="tel" name="phone" required placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} className="input" style={inputStyle} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                Continue <HiOutlineArrowRight />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--accent-soft)',
                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                borderRadius: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}>
                Creating <strong style={{ color: 'var(--accent)' }}>{form.role === 'hospital' ? 'Hospital' : 'Donor'}</strong> account for <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', marginLeft: '0.5rem', textDecoration: 'underline' }}>
                  Change
                </button>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input type={showPwd ? 'text' : 'password'} name="password" required minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} className="input" style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                    {showPwd ? <HiOutlineEyeOff style={{ width: '1rem', height: '1rem' }} /> : <HiOutlineEye style={{ width: '1rem', height: '1rem' }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input type="password" name="confirmPassword" required minLength={6} placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} className="input"
                    style={{
                      ...inputStyle,
                      borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#f87171' : undefined,
                    }}
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.25rem' }}>Passwords don't match</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, padding: '0.875rem', fontSize: '0.9rem', cursor: 'pointer', border: '1px solid var(--border)' }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)} className="btn-primary" style={{ flex: 2, padding: '0.875rem', fontSize: '0.9rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {loading ? (
                    <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />Creating...</>
                  ) : 'Create Account 🎉'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes blob { 0%{transform:translate(0,0)scale(1)}33%{transform:translate(30px,-50px)scale(1.1)}66%{transform:translate(-20px,20px)scale(0.9)}100%{transform:translate(0,0)scale(1)} }`}</style>
    </div>
  );
};

export default Register;
