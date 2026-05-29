import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonations } from '../redux/slices/donorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const StatBox = ({ label, value, color, emoji }) => (
  <div style={{
    background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)',
    borderRadius: '1rem', padding: '1.25rem 1.5rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    boxShadow: 'var(--glass-shadow)',
  }}>
    <div style={{
      width: '3rem', height: '3rem', borderRadius: '0.75rem',
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: '1.25rem',
    }}>
      {emoji}
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, marginTop: '0.2rem', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    </div>
  </div>
);

const DonationHistory = () => {
  const dispatch = useDispatch();
  const { myDonations, myProfile, loading } = useSelector(s => s.donors);

  useEffect(() => { dispatch(fetchMyDonations()); }, [dispatch]);

  const approved = myDonations?.filter(d => ['approved', 'completed', 'stored'].includes(d.status)).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
          Donation History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Your complete blood donation record
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatBox label="Total Donations" value={myDonations?.length || 0} color="#f87171" emoji="❤️" />
        <StatBox label="Approved"        value={approved}                   color="#4ade80" emoji="✅" />
        <StatBox label="Blood Group"     value={myProfile?.bloodGroup || '—'} color="#60a5fa" emoji="🩸" />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
        {loading && !myDonations?.length ? (
          <LoadingSpinner text="Loading history…" />
        ) : !myDonations?.length ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Donations Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your donation history will appear here after your first contribution.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH c="Donation ID" /><TH c="Date" /><TH c="Group" /><TH c="Quantity" /><TH c="Status" /><TH c="Notes" /></tr></thead>
              <tbody>
                {myDonations.map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{d.donationId || d._id?.slice(-8)}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{new Date(d.donationDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={d.bloodGroup} size="sm" /></td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{d.quantity} ml</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;
