import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, verify2FAUser, loginWithGoogle, loginWithGithub, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight } from 'react-icons/hi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && user) navigate(`/${user.role}`);
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [isAuthenticated, user, error, navigate, dispatch]);

  useEffect(() => {
    // Check for Google ID Token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1)); // remove '#'
    const googleIdToken = hashParams.get('id_token');
    if (googleIdToken) {
      const toastId = toast.loading('Signing in with Google...');
      dispatch(loginWithGoogle(googleIdToken))
        .unwrap()
        .then((res) => {
          toast.success(`🎉 Welcome back, ${res.user.name}!`, { id: toastId });
          navigate(`/${res.user.role}`);
        })
        .catch((err) => {
          toast.error(err || 'Google authentication failed.', { id: toastId });
        });
      // Clean hash params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(resultAction)) {
      const data = resultAction.payload;
      if (data.twoFactorRequired) {
        setTempToken(data.tempToken);
        setShowOtp(true);
        toast.success('🔒 2FA Required: Please check your email or SMS logs for the OTP.');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP.');
    }
    const resultAction = await dispatch(verify2FAUser({ tempToken, code: otpCode }));
    if (verify2FAUser.fulfilled.match(resultAction)) {
      toast.success('🎉 Successfully verified and logged in!');
      navigate(`/${resultAction.payload.user.role}`);
    }
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
            {showOtp ? 'Verification' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            {showOtp ? 'Enter your 2FA OTP code' : 'Sign in to your BBMS account'}
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
          {showOtp ? (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Verification Code (OTP)
                </label>
                <div style={{ position: 'relative' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="input"
                    style={{
                      width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                      fontSize: '0.9rem',
                      letterSpacing: '0.3em',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

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
                    Verifying...
                  </>
                ) : (
                  <>Verify & Sign In <HiOutlineArrowRight /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtpCode('');
                  setTempToken(null);
                  dispatch(clearError());
                }}
                style={{
                  width: '100%', padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--btn-radius)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                ← Back to Login
              </button>
            </form>
          ) : (
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
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* OAuth Buttons */}
          {!showOtp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '918823726770-3uk2ad0cfhltnn1cj0s829rbtt16amnk.apps.googleusercontent.com';
                  const redirect_uri = encodeURIComponent(window.location.origin + '/login');
                  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=id_token&scope=openid%20email%20profile&nonce=bbmsnonce`;
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                  width: '100%', padding: '0.75rem', borderRadius: 'var(--btn-radius)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <svg style={{ width: '1.1rem', height: '1.1rem' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}

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
