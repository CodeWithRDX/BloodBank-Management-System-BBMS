import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelAppointment } from '../redux/slices/appointmentSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import usePolling from '../hooks/usePolling';

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{c}</th>
);

const DonorAppointments = () => {
  const dispatch = useDispatch();
  const { myAppointments, loading } = useSelector(s => s.appointments);

  usePolling(() => {
    dispatch(fetchMyAppointments());
  }, 10000);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    const res = await dispatch(cancelAppointment(id));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Appointment cancelled');
    else toast.error(res.payload || 'Failed to cancel');
  };

  const upcoming = myAppointments?.filter(a => ['Pending', 'Approved', 'Ongoing'].includes(a.status)) || [];
  const past     = myAppointments?.filter(a => !['Pending', 'Approved', 'Ongoing'].includes(a.status)) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            My Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Manage your blood donation appointments
          </p>
        </div>
        <Link to="/donor/appointments/new" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.625rem 1.25rem', background: 'var(--gradient-primary)', color: 'white',
          borderRadius: 'var(--btn-radius)', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
          boxShadow: '0 0 16px var(--accent-glow)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
        >
          <HiOutlinePlus style={{ width: '1rem', height: '1rem' }} /> Book Appointment
        </Link>
      </div>

      {loading && !myAppointments?.length ? (
        <LoadingSpinner size="lg" text="Loading appointments…" />
      ) : (
        <>
          {/* Upcoming */}
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                Upcoming <span style={{ color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', marginLeft: '0.375rem' }}>{upcoming.length}</span>
              </h3>
            </div>

            {upcoming.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No upcoming appointments</p>
                <Link to="/donor/appointments/new" style={{ display: 'inline-block', marginTop: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                  Book your first appointment →
                </Link>
              </div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {upcoming.map(apt => (
                  <li key={apt._id} style={{
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '1rem', flexWrap: 'wrap', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                        📅
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Donation Appointment ({apt.component?.replace('_', ' ')})</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.15rem' }}>🕐 {apt.timeSlot} · 📍 {apt.branchId?.name || apt.location || 'Selected Center'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      <StatusBadge status={apt.status} />
                      {['Pending', 'Approved'].includes(apt.status) && (
                        <button onClick={() => handleCancel(apt._id)} title="Cancel appointment"
                          style={{ padding: '0.35rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '0.5rem', cursor: 'pointer', color: '#f87171', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                        >
                          <HiOutlineX style={{ width: '0.9rem', height: '0.9rem' }} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
              <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                  Past Appointments <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.82rem' }}>({past.length})</span>
                </h3>
              </div>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH c="Date" /><TH c="Time" /><TH c="Branch / Location" /><TH c="Component" /><TH c="Status" /></tr></thead>
                  <tbody>
                    {past.map(apt => (
                      <tr key={apt._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                      >
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{new Date(apt.date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.timeSlot}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.branchId?.name || apt.location || '—'}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.component?.replace('_', ' ') || 'whole blood'}</td>
                        <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={apt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonorAppointments;
