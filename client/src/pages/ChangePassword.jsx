import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi';

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const { loading, error, user } = useSelector(s => s.auth);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('All fields are required');
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (form.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (form.newPassword === form.currentPassword) {
      return toast.error('New password cannot be the same as current password');
    }

    const res = await dispatch(updatePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Password updated successfully!');
      // Navigate to dashboard based on role
      const targetDashboard = user?.role ? `/${user.role}` : '/';
      navigate(targetDashboard);
    }
  };

  const handleBack = () => {
    if (isExpired) {
      toast.error('You must update your password to continue.');
    } else {
      const targetDashboard = user?.role ? `/${user.role}` : '/';
      navigate(targetDashboard);
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
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '18rem',
        height: '18rem',
        borderRadius: '50%',
        background: 'var(--accent-glow)',
        filter: 'blur(70px)',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      <div className="animate-scaleIn" style={{ width: '100%', maxWidth: '26rem', position: 'relative', zIndex: 1 }}>
        
        {/* Back Button (disabled/alerted if expired) */}
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '1.75rem',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <HiOutlineArrowLeft style={{ width: '0.9rem', height: '0.9rem' }} /> Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '1rem',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.875rem',
            boxShadow: '0 0 20px var(--accent-glow)',
            fontSize: '1.25rem'
          }}>
            🔒
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.025em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Update Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.375rem' }}>
            Maintain security by updating your credential regularly
          </p>
        </div>

        {/* Expired alert banner */}
        {isExpired && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
            animation: 'pulseGlow 2s infinite',
          }}>
            <HiOutlineExclamationCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>Password Expired</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem', lineHeight: 1.4 }}>
                For security compliance, passwords must be updated every 90 days. Please set a new password to unlock your account.
              </p>
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: 'var(--card-shadow)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  className="input"
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                >
                  {showCurrent ? <HiOutlineEyeOff style={{ width: '1rem', height: '1rem' }} /> : <HiOutlineEye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className="input"
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                >
                  {showNew ? <HiOutlineEyeOff style={{ width: '1rem', height: '1rem' }} /> : <HiOutlineEye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                    fontSize: '0.9rem',
                    borderColor: form.confirmPassword && form.newPassword !== form.confirmPassword ? '#f87171' : undefined,
                  }}
                />
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.25rem' }}>Passwords don't match</p>
              )}
            </div>

            {/* Strength estimator */}
            {form.newPassword && (
              <div>
                <div style={{ height: '0.3rem', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '999px',
                    transition: 'all 0.3s',
                    width: form.newPassword.length < 6 ? '25%' : form.newPassword.length < 10 ? '60%' : '100%',
                    background: form.newPassword.length < 6 ? '#f87171' : form.newPassword.length < 10 ? '#fbbf24' : '#4ade80',
                  }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  Strength: {form.newPassword.length < 6 ? '🔴 Weak' : form.newPassword.length < 10 ? '🟡 Fair' : '🟢 Strong'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (form.confirmPassword && form.newPassword !== form.confirmPassword)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '0.9rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Updating…
                </>
              ) : 'Update Password 🔒'}
            </button>

          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ChangePassword;
