import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowLeft } from 'react-icons/hi';
import AnimatedBackground from '../components/AnimatedBackground';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await dispatch(resetPassword({ token, password: form.password }));
    if (res.meta.requestStatus === 'fulfilled') {
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
    }}>
      <AnimatedBackground variant="minimal" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: '24rem', position: 'relative', zIndex: 1 }}
      >
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, marginBottom: '1.75rem', transition: 'color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <HiOutlineArrowLeft style={{ width: '0.9rem', height: '0.9rem' }} /> Back to sign in
        </Link>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', boxShadow: '0 0 24px rgba(239,68,68,0.3)', fontSize: '1.25rem' }}>
            🔐
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif" }}>
            New Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.375rem' }}>
            Choose a strong password for your account
          </p>
        </div>

        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65 }}>
                Your password has been updated. Redirecting to sign in…
              </p>
              <div style={{ marginTop: '1rem', height: '0.25rem', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#4ade80', animation: 'progress 3s linear forwards', borderRadius: '999px' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {/* New password */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required minLength={6}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', fontSize: '0.9rem' }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                    {showPwd ? <HiOutlineEyeOff style={{ width: '1rem', height: '1rem' }} /> : <HiOutlineEye style={{ width: '1rem', height: '1rem' }} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input
                    type="password" required minLength={6}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="input"
                    style={{
                      width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem', fontSize: '0.9rem',
                      borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#f87171' : undefined,
                    }}
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.25rem' }}>Passwords don't match</p>
                )}
              </div>

              {/* Strength bar */}
              {form.password && (
                <div>
                  <div style={{ height: '0.3rem', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '999px', transition: 'all 0.3s',
                      width: form.password.length < 6 ? '25%' : form.password.length < 10 ? '60%' : '100%',
                      background: form.password.length < 6 ? '#f87171' : form.password.length < 10 ? '#fbbf24' : '#4ade80',
                    }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                    Strength: {form.password.length < 6 ? '🔴 Weak' : form.password.length < 10 ? '🟡 Fair' : '🟢 Strong'}
                  </p>
                </div>
              )}

              <button
                type="submit" disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
              >
                {loading ? (
                  <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />Resetting…</>
                ) : 'Reset Password 🔐'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes progress { from { width: 0; } to { width: 100%; } }`}</style>
    </div>
  );
};

export default ResetPassword;
