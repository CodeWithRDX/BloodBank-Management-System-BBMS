import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventorySummary } from '../redux/slices/inventorySlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import { Link } from 'react-router-dom';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPAT = {
  'O-':  { receive: ['O-'],                                         donate: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  'O+':  { receive: ['O-','O+'],                                    donate: ['A+','B+','AB+','O+'] },
  'A-':  { receive: ['A-','O-'],                                    donate: ['A+','A-','AB+','AB-'] },
  'A+':  { receive: ['A+','A-','O+','O-'],                          donate: ['A+','AB+'] },
  'B-':  { receive: ['B-','O-'],                                    donate: ['B+','B-','AB+','AB-'] },
  'B+':  { receive: ['B+','B-','O+','O-'],                          donate: ['B+','AB+'] },
  'AB-': { receive: ['AB-','A-','B-','O-'],                         donate: ['AB+','AB-'] },
  'AB+': { receive: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],   donate: ['AB+'] },
};

const LEVEL = (u) => {
  if (u === 0) return { label: 'Out of Stock', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' };
  if (u < 5)  return { label: 'Low Stock',     color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)'  };
  if (u < 15) return { label: 'Moderate',      color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'   };
  return               { label: 'Available',   color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)'   };
};

const HospitalInventorySearch = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector(s => s.inventory);
  const [selected, setSelected] = useState('');

  useEffect(() => { dispatch(fetchInventorySummary()); }, [dispatch]);

  const compat = selected ? COMPAT[selected]?.receive || [] : [];
  const filtered = selected ? summary?.filter(i => compat.includes(i.bloodGroup)) : summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
          Blood Inventory Search
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Check real-time availability and blood group compatibility
        </p>
      </div>

      {/* Selector card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          🔍 Filter by Patient's Blood Group
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setSelected('')} style={{
            padding: '0.45rem 1rem', borderRadius: '999px', border: `1px solid ${!selected ? 'var(--accent)' : 'var(--border)'}`,
            background: !selected ? 'var(--accent)' : 'var(--bg-elevated)',
            color: !selected ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
          }}>All Groups</button>
          {BLOOD_GROUPS.map(g => (
            <button key={g} onClick={() => setSelected(g)} style={{
              padding: '0.45rem 1rem', borderRadius: '999px',
              border: `1px solid ${selected === g ? 'var(--accent)' : 'var(--border)'}`,
              background: selected === g ? 'var(--accent)' : 'var(--bg-elevated)',
              color: selected === g ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', sans-serif",
            }}>{g}</button>
          ))}
        </div>

        {selected && (
          <div style={{ marginTop: '1rem', padding: '0.875rem 1.125rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '0.875rem', fontSize: '0.82rem' }}>
            <p style={{ color: '#60a5fa' }}>
              ℹ️ <strong>Blood group {selected}</strong> patients can receive from: <strong>{compat.join(', ')}</strong>. Showing compatible units below.
            </p>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? <LoadingSpinner text="Loading inventory…" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {filtered?.map(item => {
            const lv = LEVEL(item.totalUnits);
            const isHighlighted = selected && compat.includes(item.bloodGroup);
            return (
              <div key={item.bloodGroup} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${isHighlighted ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`,
                borderRadius: '1.25rem', padding: '1.5rem',
                textAlign: 'center', transition: 'all 0.2s',
                boxShadow: isHighlighted ? '0 0 16px rgba(74,222,128,0.15)' : 'var(--card-shadow)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.875rem' }}>
                  <BloodGroupBadge group={item.bloodGroup} size="lg" />
                </div>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: lv.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
                  {item.totalUnits}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                  Units
                </p>
                <span style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.2rem 0.625rem', borderRadius: '999px', background: lv.bg, border: `1px solid ${lv.border}`, color: lv.color, fontSize: '0.68rem', fontWeight: 700 }}>
                  {lv.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>⚡ Need Blood Urgently?</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Submit a request and our team will process it as quickly as possible.</p>
        </div>
        <Link to="/hospital/requests/new" style={{
          padding: '0.625rem 1.5rem', background: 'var(--accent)', color: 'white',
          borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
          boxShadow: '0 0 14px var(--accent-glow)', whiteSpace: 'nowrap', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
        >
          New Request →
        </Link>
      </div>
    </div>
  );
};

export default HospitalInventorySearch;
