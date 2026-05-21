const SIZE_STYLES = {
  xs: { padding: '0.1rem 0.4rem', fontSize: '0.65rem', borderRadius: '0.375rem' },
  sm: { padding: '0.2rem 0.6rem', fontSize: '0.72rem', borderRadius: '0.5rem'   },
  md: { padding: '0.35rem 0.875rem', fontSize: '0.85rem', borderRadius: '0.625rem' },
  lg: { padding: '0.5rem 1.25rem', fontSize: '1.1rem', borderRadius: '0.75rem', fontWeight: 800 },
};

const BLOOD_COLORS = {
  'A+':  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#f87171' },
  'A-':  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  'B+':  { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.35)', text: '#fb923c' },
  'B-':  { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)', text: '#fdba74' },
  'AB+': { bg: 'rgba(167,139,250,0.12)',border: 'rgba(167,139,250,0.35)',text: '#a78bfa' },
  'AB-': { bg: 'rgba(167,139,250,0.08)',border: 'rgba(167,139,250,0.25)',text: '#c4b5fd' },
  'O+':  { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', text: '#34d399' },
  'O-':  { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', text: '#6ee7b7' },
};

const BloodGroupBadge = ({ group, size = 'sm' }) => {
  if (!group) return null;
  const c = BLOOD_COLORS[group] || { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' };
  const s = SIZE_STYLES[size] || SIZE_STYLES.sm;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.2rem',
      ...s,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      fontWeight: 700,
      letterSpacing: '0.02em',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {size === 'lg' && <span>🩸</span>}
      {group}
    </span>
  );
};

export default BloodGroupBadge;
