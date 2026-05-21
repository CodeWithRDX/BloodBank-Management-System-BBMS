import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests } from '../redux/slices/requestSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { HiOutlinePlus } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

import usePolling from '../hooks/usePolling';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected', 'completed', 'cancelled'];

const HospitalRequests = () => {
  const dispatch = useDispatch();
  const { myRequests, loading } = useSelector(s => s.requests);
  const [statusFilter, setStatusFilter] = useState('');

  usePolling(() => {
    dispatch(fetchMyRequests());
  }, 10000);

  const filtered = statusFilter ? myRequests?.filter(r => r.status === statusFilter) : myRequests;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            My Blood Requests
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {myRequests?.length || 0} total requests submitted
          </p>
        </div>
        <Link to="/hospital/requests/new" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.625rem 1.25rem', background: 'var(--accent)', color: 'white',
          borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
          boxShadow: '0 0 16px var(--accent-glow)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
        >
          <HiOutlinePlus style={{ width: '1rem', height: '1rem' }} /> New Request
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
              background: statusFilter === s ? 'var(--accent)' : 'var(--bg-surface)',
              color: statusFilter === s ? 'white' : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        {loading && !myRequests?.length ? (
          <LoadingSpinner text="Loading requests…" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}>
                <TH c="Request ID" /><TH c="Patient" /><TH c="Group" /><TH c="Qty" /><TH c="Urgency" /><TH c="Submitted" /><TH c="Status" /><TH c="Notes" />
              </tr></thead>
              <tbody>
                {filtered?.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{r.requestId}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{r.patientName}</p>
                      {r.reason && <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{r.reason}</p>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>{r.quantity}u</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.urgency} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', maxWidth: '180px' }}>
                      {r.status === 'rejected' && r.rejectionReason
                        ? <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{r.rejectionReason}</span>
                        : <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{r.notes || '—'}</span>
                      }
                    </td>
                  </tr>
                ))}
                {!filtered?.length && (
                  <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {statusFilter ? `No ${statusFilter} requests` : 'No requests yet'}
                    </p>
                    {!statusFilter && (
                      <Link to="/hospital/requests/new" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                        Create your first blood request →
                      </Link>
                    )}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalRequests;
