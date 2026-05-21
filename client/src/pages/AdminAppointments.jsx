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
        {['', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)} style={{
            padding: '0.35rem 0.875rem', borderRadius: '999px',
            border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
            background: statusFilter === s ? 'var(--accent)' : 'var(--bg-surface)',
            color: statusFilter === s ? 'white' : 'var(--text-secondary)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {s.replace('_', ' ') || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        {loading ? <LoadingSpinner text="Loading appointments…" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}>
                <TH c="Donor" /><TH c="Group" /><TH c="Date" /><TH c="Time" /><TH c="Location" /><TH c="Status" /><TH c="Actions" right />
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
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.location || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={apt.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        {apt.status === 'scheduled' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'confirmed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '0.4rem', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}>
                              Confirm
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.4rem', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}>
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(apt._id, 'completed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                            Complete
                          </button>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
