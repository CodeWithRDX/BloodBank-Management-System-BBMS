const StatsCard = ({ title, value, icon: Icon, color = 'accent', subtitle, trend }) => {
  const colorStyles = {
    accent:  { icon: 'var(--accent)', glow: 'var(--accent-glow)', bg: 'var(--accent-soft)' },
    red:     { icon: '#f87171',       glow: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.1)' },
    blue:    { icon: '#60a5fa',       glow: 'rgba(96,165,250,0.3)',  bg: 'rgba(96,165,250,0.1)' },
    green:   { icon: '#4ade80',       glow: 'rgba(74,222,128,0.3)',  bg: 'rgba(74,222,128,0.1)' },
    amber:   { icon: '#fbbf24',       glow: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.1)' },
    purple:  { icon: '#a78bfa',       glow: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.1)' },
    cyan:    { icon: '#22d3ee',       glow: 'rgba(34,211,238,0.3)',  bg: 'rgba(34,211,238,0.1)' },
    pink:    { icon: '#f472b6',       glow: 'rgba(244,114,182,0.3)', bg: 'rgba(244,114,182,0.1)' },
  };

  const c = colorStyles[color] || colorStyles.accent;

  return (
    <div
      className="animate-fadeUp"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--card-shadow)',
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = c.icon;
        e.currentTarget.style.boxShadow = `var(--card-shadow), 0 0 20px ${c.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute',
        top: '-1.5rem',
        right: '-1.5rem',
        width: '5rem',
        height: '5rem',
        borderRadius: '50%',
        background: c.bg,
        filter: 'blur(16px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </p>
          <p style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, marginTop: '0.375rem', fontFamily: "'Space Grotesk', sans-serif" }}>
            {value ?? '—'}
          </p>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.3rem' }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{ fontSize: '0.72rem', marginTop: '0.3rem', color: trend >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>

        {Icon && (
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.875rem',
            background: c.bg,
            border: `1px solid ${c.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 16px ${c.glow}`,
          }}>
            <Icon style={{ width: '1.4rem', height: '1.4rem', color: c.icon }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
