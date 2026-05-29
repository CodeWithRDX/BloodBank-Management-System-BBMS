import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventorySummary } from '../redux/slices/inventorySlice';
import BloodGroupBadge from '../components/BloodGroupBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const COMPAT = {
  'A+':  ['A+', 'AB+'],
  'A-':  ['A+', 'A-', 'AB+', 'AB-'],
  'B+':  ['B+', 'AB+'],
  'B-':  ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+':  ['A+', 'B+', 'AB+', 'O+'],
  'O-':  ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

const LEVEL_STYLES = (units) => {
  if (units === 0)   return { label: 'Out of Stock', color: '#94a3b8', bar: '#334155',  pct: 0 };
  if (units < 5)     return { label: 'Critical',     color: '#f87171', bar: '#ef4444',  pct: Math.min(units / 20 * 100, 100) };
  if (units < 15)    return { label: 'Low',          color: '#fbbf24', bar: '#f59e0b',  pct: Math.min(units / 20 * 100, 100) };
  return               { label: 'Sufficient',        color: '#4ade80', bar: '#22c55e',  pct: Math.min(units / 30 * 100, 100) };
};

const Inventory = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector(s => s.inventory);

  useEffect(() => { dispatch(fetchInventorySummary()); }, [dispatch]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '3.5rem 1.5rem 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-3rem', left: '50%', transform: 'translateX(-50%)', width: '20rem', height: '10rem', background: 'var(--accent-glow)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '40rem', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.875rem', borderRadius: '999px', background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
            🔴 Live · Updated every 5 minutes
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.75rem' }}>
            Blood Availability
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Real-time blood bank inventory — know what's available before you request.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '68rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {loading ? (
          <LoadingSpinner size="lg" text="Fetching latest inventory…" />
        ) : (
          <>
            {/* Stock cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {(summary || []).map((item, i) => {
                const level = LEVEL_STYLES(item.totalUnits);
                const compat = COMPAT[item.bloodGroup] || [];
                return (
                  <div
                    key={item.bloodGroup}
                    className={`animate-fadeUp delay-${['75','150','300','500','75','150','300','500'][i]}`}
                    style={{
                      background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid var(--border)`,
                      borderRadius: '1.25rem',
                      padding: '1.5rem',
                      boxShadow: 'var(--glass-shadow)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = level.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `var(--card-shadow), 0 0 20px color-mix(in srgb, ${level.color} 20%, transparent)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <BloodGroupBadge group={item.bloodGroup} size="md" />
                      <span style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', background: `color-mix(in srgb, ${level.color} 15%, transparent)`, color: level.color, fontSize: '0.68rem', fontWeight: 700, border: `1px solid color-mix(in srgb, ${level.color} 30%, transparent)` }}>
                        {level.label}
                      </span>
                    </div>

                    {/* Units count */}
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: level.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, marginBottom: '0.25rem' }}>
                      {item.totalUnits}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>units available</p>

                    {/* Progress bar */}
                    <div style={{ height: '0.35rem', borderRadius: '999px', background: 'var(--bg-elevated)', marginBottom: '1rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${level.pct}%`, background: level.bar, borderRadius: '999px', transition: 'width 1s ease' }} />
                    </div>

                    {/* Compatibility */}
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
                        Can donate to
                      </p>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {compat.map(g => (
                          <span key={g} style={{ padding: '0.15rem 0.4rem', borderRadius: '0.375rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600 }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🩸</div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                Ready to donate?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Your blood can save up to 3 lives. Register as a donor today.
              </p>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 2rem', background: 'var(--gradient-primary)', color: 'white',
                borderRadius: 'var(--btn-radius)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 0 20px var(--accent-glow)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Register as Donor →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
