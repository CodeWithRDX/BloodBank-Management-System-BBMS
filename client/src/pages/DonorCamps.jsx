import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCamps, registerForCamp, fetchMyRegistrations } from '../redux/slices/campSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiCheck, FiRefreshCw, FiAward } from 'react-icons/fi';

export default function DonorCamps() {
  const dispatch = useDispatch();
  const { camps, myRegistrations, loading } = useSelector((s) => s.camps);

  useEffect(() => {
    loadDonorCamps();
  }, [dispatch]);

  const loadDonorCamps = () => {
    dispatch(fetchCamps({ upcoming: true }));
    dispatch(fetchMyRegistrations());
  };

  const handleRegister = async (campId, campName) => {
    try {
      const res = await dispatch(registerForCamp(campId)).unwrap();
      if (res.success) {
        toast.success(`🎉 Registered successfully for "${campName}"!`);
        loadDonorCamps();
      }
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const isRegistered = (campId) => {
    return myRegistrations.some((reg) => reg.campId?._id === campId || reg.campId === campId);
  };

  const getRegistrationDetails = (campId) => {
    return myRegistrations.find((reg) => reg.campId?._id === campId || reg.campId === campId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            🩸 Donation Camps
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Find upcoming neighborhood blood donation camps and register to save lives
          </p>
        </div>
        <button
          onClick={loadDonorCamps}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          <FiRefreshCw /> Refresh List
        </button>
      </div>

      {/* Main Grid: split into upcoming camps and registrations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Upcoming Camps Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Upcoming Donation Camps
          </h2>

          {loading ? (
            <LoadingSpinner text="Searching upcoming camps..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {camps.filter(c => c.status === 'upcoming').map((camp) => {
                const registered = isRegistered(camp._id);
                const regDetails = getRegistrationDetails(camp._id);

                return (
                  <div
                    key={camp._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {camp.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          Organized by {camp.organizer}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiCalendar style={{ color: 'var(--accent)' }} />
                          {new Date(camp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiClock style={{ color: 'var(--accent)' }} />
                          {camp.startTime} - {camp.endTime}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span>{camp.address?.street}, {camp.address?.city}, {camp.address?.state}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <FiUsers style={{ color: 'var(--accent)' }} />
                        <span>Capacity: {camp.totalRegistrations} / {camp.maxDonors} registered</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      {registered ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{
                            padding: '6px 14px',
                            background: 'rgba(16,185,129,0.15)',
                            color: '#10b981',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <FiCheck /> Registered
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            Card: {regDetails?.registrationId || 'Pending'}
                          </span>
                        </div>
                      ) : (
                        <button
                          disabled={camp.totalRegistrations >= camp.maxDonors}
                          onClick={() => handleRegister(camp._id, camp.name)}
                          className="btn-primary"
                          style={{
                            padding: '8px 20px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            opacity: camp.totalRegistrations >= camp.maxDonors ? 0.5 : 1
                          }}
                        >
                          {camp.totalRegistrations >= camp.maxDonors ? 'Fully Booked' : 'One-Click Register'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {camps.filter(c => c.status === 'upcoming').length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)' }}>
                  No upcoming donation camps found in your area at the moment.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Registered Cards Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            My Registrations
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {myRegistrations.map((reg) => {
              const camp = reg.campId;
              if (!camp) return null;

              return (
                <div
                  key={reg._id}
                  style={{
                    background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))',
                    border: '1px dashed var(--accent)',
                    borderRadius: 14,
                    padding: '1.25rem',
                    boxShadow: 'var(--card-shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative background watermark */}
                  <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '5rem', opacity: 0.05, pointerEvents: 'none' }}>
                    🩸
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                      DONOR PASS
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: reg.status === 'donated' ? 'rgba(16,185,129,0.15)' : reg.status === 'attended' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                      color: reg.status === 'donated' ? '#10b981' : reg.status === 'attended' ? '#818cf8' : '#f59e0b'
                    }}>
                      {reg.status?.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {camp.name}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Organizer: {camp.organizer || 'Local Branch'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCalendar style={{ color: 'var(--accent)' }} />
                      {new Date(camp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiClock style={{ color: 'var(--accent)' }} />
                      {camp.startTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span>{camp.address?.street}, {camp.address?.city}</span>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px dashed var(--border)',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>REGISTRATION ID</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {reg.registrationId || 'Pending'}
                      </div>
                    </div>

                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#fff',
                      borderRadius: 4,
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)'
                    }}
                    title="QR Code for Check-in"
                    >
                      {/* Placeholder QR representation */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', width: '32px', height: '32px' }}>
                        {[...Array(16)].map((_, i) => (
                          <div key={i} style={{ background: (i % 3 === 0 || i % 5 === 2) ? '#000' : '#fff' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {myRegistrations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                You have not registered for any upcoming camps yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
