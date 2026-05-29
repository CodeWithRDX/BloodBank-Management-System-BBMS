import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests } from '../redux/slices/requestSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock, HiOutlinePlus } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

import usePolling from '../hooks/usePolling';

const HospitalDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myRequests, loading } = useSelector(s => s.requests);

  usePolling(() => {
    dispatch(fetchMyRequests());
  }, 10000);

  if (loading && !myRequests?.length) return <LoadingSpinner size="lg" text="Loading dashboard…" />;

  const pending   = myRequests?.filter(r => r.status === 'pending').length   || 0;
  const approved  = myRequests?.filter(r => r.status === 'approved').length  || 0;
  const completed = myRequests?.filter(r => r.status === 'completed').length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            🏥 Hospital Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Blood request management for <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
          </p>
        </div>
        <Link to="/hospital/requests/new" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.625rem 1.25rem', background: 'var(--gradient-primary)', color: 'white',
          borderRadius: 'var(--btn-radius)', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
          boxShadow: '0 0 20px rgba(239,68,68,0.3)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
        >
          <HiOutlinePlus style={{ width: '1rem', height: '1rem' }} /> New Request
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatsCard title="Pending"   value={pending}            icon={HiOutlineClock}         color="amber" />
        <StatsCard title="Approved"  value={approved}           icon={HiOutlineClipboardList} color="blue"  />
        <StatsCard title="Completed" value={completed}          icon={HiOutlineCheckCircle}   color="green" />
        <StatsCard title="Total"     value={myRequests?.length || 0} icon={HiOutlineClipboardList} color="purple" />
      </div>

      {/* Recent requests table */}
      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Recent Requests</h3>
          <Link to="/hospital/requests" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>View All →</Link>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH c="Request ID" /><TH c="Patient" /><TH c="Group" /><TH c="Urgency" /><TH c="Date" /><TH c="Status" /></tr></thead>
            <tbody>
              {myRequests?.slice(0, 10).map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{r.requestId}</td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{r.patientName}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.urgency} /></td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {!myRequests?.length && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>No requests yet</p>
                  <Link to="/hospital/requests/new" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>Create your first request →</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
