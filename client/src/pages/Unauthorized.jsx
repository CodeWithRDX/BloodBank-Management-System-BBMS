import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Unauthorized = () => {
  const { user } = useSelector(s => s.auth);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '24rem', height: '24rem', borderRadius: '50%', background: 'rgba(248,113,113,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="animate-scaleIn" style={{ textAlign: 'center', maxWidth: '28rem', position: 'relative', zIndex: 1 }}>
        {/* Big 403 */}
        <div style={{
          fontSize: 'clamp(5rem, 15vw, 8rem)',
          fontWeight: 900,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '-0.05em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #f87171, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          textShadow: 'none',
        }}>
          403
        </div>

        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          Access Denied
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '2rem' }}>
          You don't have permission to view this page. This area is restricted to authorized roles only.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link
              to={`/${user.role}`}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'var(--accent)', color: 'white',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 0 18px var(--accent-glow)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
            >
              ← Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '0.75rem 1.75rem',
                background: 'var(--accent)', color: 'white',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 0 18px var(--accent-glow)', transition: 'all 0.2s',
              }}
            >
              Sign In
            </Link>
          )}
          <Link
            to="/"
            style={{
              padding: '0.75rem 1.75rem',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
