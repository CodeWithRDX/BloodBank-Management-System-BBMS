import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, updateRequestStatus } from '../redux/slices/requestSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye } from 'react-icons/hi';

import usePolling from '../hooks/usePolling';

const TH = ({ c, right }) => (
  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminRequests = () => {
  const dispatch = useDispatch();
  const { requests, loading } = useSelector(s => s.requests);
  const [selected, setSelected] = useState(null);
  const [rejReason, setRejReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadRequests = () => {
    const p = new URLSearchParams();
    if (filterStatus) p.set('status', filterStatus);
    dispatch(fetchRequests(p.toString()));
  };

  usePolling(loadRequests, 10000, [filterStatus]);

  const handleStatus = async (id, status, reason = '') => {
    const res = await dispatch(updateRequestStatus({ id, statusData: { status, rejectionReason: reason } }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`Request ${status}!`);
      setSelected(null); setRejReason('');
    } else toast.error(res.payload || 'Failed to update');
  };

  const filtered = filterStatus ? requests?.filter(r => r.status === filterStatus) : requests;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>Blood Requests</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Review and manage hospital blood requests</p>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem 0.875rem', fontSize: '0.82rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {[['', 'All Statuses'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['completed', 'Completed']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? <LoadingSpinner text="Loading requests…" /> : (
          <table style={{ borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH c="Request ID" /><TH c="Hospital" /><TH c="Patient" /><TH c="Group" /><TH c="Qty" /><TH c="Urgency" /><TH c="Date" /><TH c="Status" /><TH c="Actions" right /></tr></thead>
            <tbody>
              {filtered?.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{r.requestId}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.hospitalId?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{r.patientName}</td>
                  <td style={{ padding: '0.875rem 1rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{r.quantity}u</td>
                  <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={r.urgency} /></td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(r._id, 'approved')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                            Approve
                          </button>
                          <button onClick={() => { setSelected(r); setRejReason(''); }} style={{ padding: '0.25rem 0.625rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.4rem', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}>
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => handleStatus(r._id, 'completed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.4rem', color: '#3b82f6', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}>
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && <tr><td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No requests found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject modal */}
      {selected && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} onClick={() => setSelected(null)} />
          <div className="animate-scaleIn" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 50, width: '90%', maxWidth: '26rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', boxShadow: 'var(--card-shadow)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>❌ Reject Request</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Rejecting request <strong style={{ color: 'var(--accent)' }}>{selected.requestId}</strong> for {selected.patientName}
            </p>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Rejection Reason</label>
            <textarea value={rejReason} onChange={e => setRejReason(e.target.value)} placeholder="Explain why this request is being rejected…" rows={3}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setSelected(null)} style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleStatus(selected._id, 'rejected', rejReason)} style={{ padding: '0.625rem 1.25rem', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '0.625rem', color: '#f87171', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                Reject Request
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRequests;
