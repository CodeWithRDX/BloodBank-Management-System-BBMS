import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight } from 'react-icons/hi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && user) navigate(`/${user.role}`);
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [isAuthenticated, user, error, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
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
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '20rem', height: '20rem', borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(70px)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: '15rem', height: '15rem', borderRadius: '50%', background: 'var(--accent-soft)', filter: 'blur(50px)', opacity: 0.5, animation: 'blob 8s infinite 2s', pointerEvents: 'none' }} />

      <div className="animate-scaleIn" style={{ width: '100%', maxWidth: '26rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 24px var(--accent-glow)',
            fontSize: '1.5rem',
          }}>
            🩸
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Sign in to your BBMS account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: 'var(--card-shadow)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input"
                  style={{
                    width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input"
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                >
                  {showPwd ? <HiOutlineEyeOff style={{ width: '1rem', height: '1rem' }} /> : <HiOutlineEye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '0.875rem',
                fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '0.375rem',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <HiOutlineArrowRight /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '1.5rem' }}>
          🔒 Protected by JWT authentication & rate limiting
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
