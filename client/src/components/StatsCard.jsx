import { useTheme } from '../theme/ThemeContext';

const StatsCard = ({ title, value, icon: Icon, color = 'accent', subtitle, trend }) => {
  const { theme } = useTheme();
  const isAnime = theme?.group === 'anime';

  const colorStyles = {
    accent:  { icon: 'var(--accent)',  glow: 'var(--accent-glow)', bg: 'var(--accent-soft)' },
    red:     { icon: '#f87171',        glow: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.12)' },
    blue:    { icon: '#60a5fa',        glow: 'rgba(96,165,250,0.35)',  bg: 'rgba(96,165,250,0.12)' },
    green:   { icon: '#4ade80',        glow: 'rgba(74,222,128,0.35)',  bg: 'rgba(74,222,128,0.12)' },
    amber:   { icon: '#fbbf24',        glow: 'rgba(251,191,36,0.35)',  bg: 'rgba(251,191,36,0.12)' },
    purple:  { icon: '#a78bfa',        glow: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.12)' },
    cyan:    { icon: '#22d3ee',        glow: 'rgba(34,211,238,0.35)',  bg: 'rgba(34,211,238,0.12)' },
    pink:    { icon: '#f472b6',        glow: 'rgba(244,114,182,0.35)', bg: 'rgba(244,114,182,0.12)' },
  };

  const c = colorStyles[color] || colorStyles.accent;

  return (
    <div
      className={`animate-fadeUp ${isAnime ? 'anime-card' : 'card'}`}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isAnime ? 'color-mix(in srgb, var(--accent) 20%, var(--border))' : 'var(--border)'}`,
        borderRadius: isAnime ? '0.75rem' : '1rem',
        padding: 'clamp(1rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.5rem)',
        boxShadow: 'var(--card-shadow)',
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = isAnime ? 'var(--accent)' : c.icon;
        e.currentTarget.style.boxShadow = isAnime
          ? `var(--card-shadow), 0 0 30px var(--anime-glow), 0 0 15px ${c.glow}`
          : `var(--card-shadow), 0 0 20px ${c.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = isAnime ? 'color-mix(in srgb, var(--accent) 20%, var(--border))' : 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: '-1.5rem', right: '-1.5rem',
        width: '5rem', height: '5rem', borderRadius: '50%',
        background: isAnime ? 'var(--anime-glow)' : c.bg,
        filter: 'blur(20px)', pointerEvents: 'none', opacity: isAnime ? 0.6 : 1,
      }} />

      {/* Anime: corner accent stripe */}
      {isAnime && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, var(--accent), var(--energy-color), transparent)`,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: isAnime ? '0.1em' : '0.06em',
            fontFamily: 'var(--font-display)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </p>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 900, lineHeight: 1,
            marginTop: '0.375rem',
            fontFamily: 'var(--font-display)',
            textShadow: isAnime ? `0 0 16px var(--accent-glow)` : 'none',
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
            boxShadow: isAnime
              ? `0 0 20px ${c.glow}, 0 0 8px var(--anime-glow)`
              : `0 0 16px ${c.glow}`,
            marginLeft: '0.75rem',
          }}>
            <Icon style={{
              width: '1.4rem', height: '1.4rem', color: c.icon,
              filter: isAnime ? `drop-shadow(0 0 4px ${c.glow})` : 'none',
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
