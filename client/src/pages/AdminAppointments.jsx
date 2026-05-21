import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments } from '../redux/slices/appointmentSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import BloodGroupBadge from '../components/BloodGroupBadge';
import API from '../api/axios';
import toast from 'react-hot-toast';

import usePolling from '../hooks/usePolling';

const TH = ({ c, right }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, total, loading } = useSelector(s => s.appointments);
  const [statusFilter, setStatusFilter] = useState('');

  const refresh = () => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    dispatch(fetchAllAppointments(p.toString()));
  };

  usePolling(refresh, 10000, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}!`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {total} total donation appointments
          </p>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>📅</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Space Grotesk', sans-serif" }}>{total} Total</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {['', 'Pending', 'Approved', 'Rejected', 'Ongoing', 'Completed', 'Cancelled', 'Missed'].map(s => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)} style={{
            padding: '0.35rem 0.875rem', borderRadius: '999px',
            border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
            background: statusFilter === s ? 'var(--accent)' : 'var(--bg-surface)',
            color: statusFilter === s ? 'white' : 'var(--text-secondary)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? <LoadingSpinner text="Loading appointments…" /> : (
          <table style={{ borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}>
                <TH c="Donor" /><TH c="Group" /><TH c="Date" /><TH c="Time" /><TH c="Branch" /><TH c="Status" /><TH c="Actions" right />
              </tr></thead>
              <tbody>
                {appointments?.map(apt => (
                  <tr key={apt._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{apt.donorId?.fullName || apt.userId?.name || 'Unknown'}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{apt.userId?.email}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {apt.donorId?.bloodGroup ? <BloodGroupBadge group={apt.donorId.bloodGroup} size="sm" /> : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{new Date(apt.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{apt.timeSlot}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.branchId?.name || apt.location || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={apt.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {apt.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'Approved')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                              Approve
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Rejected')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.4rem', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                              Reject
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'Approved' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'Ongoing')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '0.4rem', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; }}>
                              Ongoing
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Missed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.4rem', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                              Missed
                            </button>
                          </>
                        )}
                        {apt.status === 'Ongoing' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'Completed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                              Complete
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!appointments?.length && (
                  <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No appointments found.</td></tr>
                )}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
