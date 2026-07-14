import { useTheme } from '../theme/ThemeContext';

const StatsCard = ({ title, value, icon: Icon, color = 'accent', subtitle, trend }) => {
  const { theme } = useTheme();

  const colorStyles = {
    accent:  { icon: 'var(--accent)',            glow: 'var(--accent-glow)', bg: 'var(--accent-soft)' },
    red:     { icon: 'var(--accent-emergency)',   glow: 'rgba(220, 38, 38, 0.25)', bg: 'rgba(220, 38, 38, 0.06)' },
    blue:    { icon: 'var(--accent-info)',        glow: 'rgba(96, 165, 250, 0.25)',  bg: 'rgba(96, 165, 250, 0.06)' },
    green:   { icon: 'var(--accent-success)',     glow: 'rgba(34, 197, 94, 0.25)',  bg: 'rgba(34, 197, 94, 0.06)' },
    amber:   { icon: 'var(--accent-warning)',     glow: 'rgba(245, 158, 11, 0.25)',  bg: 'rgba(245, 158, 11, 0.06)' },
    purple:  { icon: 'var(--accent-inventory)',   glow: 'rgba(139, 92, 246, 0.25)', bg: 'rgba(139, 92, 246, 0.06)' },
    cyan:    { icon: 'var(--accent-secondary)',   glow: 'rgba(79, 195, 247, 0.25)',  bg: 'rgba(79, 195, 247, 0.06)' },
    pink:    { icon: 'var(--accent)',            glow: 'var(--accent-glow)', bg: 'var(--accent-soft)' },
  };

  const c = colorStyles[color] || colorStyles.accent;

  return (
    <div
      className="animate-fadeUp glass-card"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '1rem',
        padding: 'clamp(1rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.5rem)',
        boxShadow: 'var(--glass-shadow)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = c.icon;
        e.currentTarget.style.boxShadow = `var(--glass-shadow), 0 0 20px ${c.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: '-1.5rem', right: '-1.5rem',
        width: '5rem', height: '5rem', borderRadius: '50%',
        background: c.bg,
        filter: 'blur(20px)', pointerEvents: 'none', opacity: 1,
      }} />

      {/* Gradient accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${c.icon}, transparent)`,
        opacity: 0.5,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Space Grotesk', sans-serif",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </p>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 900, lineHeight: 1,
            marginTop: '0.375rem',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {value ?? '—'}
          </p>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.3rem' }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{
              fontSize: '0.72rem', marginTop: '0.3rem',
              color: trend >= 0 ? '#4ade80' : '#f87171', fontWeight: 700,
              textShadow: trend >= 0 ? '0 0 8px rgba(74,222,128,0.4)' : '0 0 8px rgba(248,113,113,0.4)',
            }}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% {trend >= 0 ? 'up' : 'down'}
            </p>
          )}
        </div>

        {Icon && (
          <div style={{
            width: '3rem', height: '3rem',
            borderRadius: 'var(--btn-radius)',
            background: c.bg,
            border: `1px solid ${c.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 16px ${c.glow}`,
            marginLeft: '0.75rem',
          }}>
            <Icon style={{
              width: '1.4rem', height: '1.4rem', color: c.icon,
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
