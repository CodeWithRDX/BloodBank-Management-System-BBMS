import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonorProfile, fetchMyDonations } from '../redux/slices/donorSlice';
import { fetchMyAppointments } from '../redux/slices/appointmentSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import {
  HiOutlineHeart, HiOutlineCalendar, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineArrowRight,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

/* ── small helpers ──────────────────────────────── */
const Row = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{c}</th>
);
const TD = ({ children, mono }) => (
  <td style={{ padding: '0.875rem 1.25rem', color: mono ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '0.85rem', fontFamily: mono ? 'monospace' : undefined }}>{children}</td>
);

import usePolling from '../hooks/usePolling';

const DonorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myProfile, myDonations, loading: dL } = useSelector(s => s.donors);
  const { myAppointments, loading: aL } = useSelector(s => s.appointments);

  usePolling(() => {
    dispatch(fetchMyDonorProfile());
    dispatch(fetchMyDonations());
    dispatch(fetchMyAppointments());
  }, 10000);

  if ((dL || aL) && !myProfile) return <LoadingSpinner size="lg" text="Loading your dashboard…" />;

  const upcoming = myAppointments?.filter(a => ['Pending', 'Approved', 'Ongoing'].includes(a.status)) || [];

  let daysSince = null, isEligible = true, nextDate = null;
  let activeCompName = 'Whole Blood';
  let maxRemaining = 0;

  if (myProfile) {
    const components = [
      { name: 'Whole Blood', key: 'lastDonationDate', cooldown: 90 },
      { name: 'Platelets', key: 'lastPlateletDonationDate', cooldown: 14 },
      { name: 'Plasma', key: 'lastPlasmaDonationDate', cooldown: 28 }
    ];

    components.forEach(comp => {
      const lastDateVal = myProfile[comp.key];
      if (lastDateVal) {
        const last = new Date(lastDateVal);
        const diffDays = Math.floor(Math.abs(new Date() - last) / 86400000);
        const remaining = comp.cooldown - diffDays;
        if (remaining > maxRemaining) {
          maxRemaining = remaining;
          activeCompName = comp.name;
          nextDate = new Date(last.getTime() + comp.cooldown * 24 * 60 * 60 * 1000);
          daysSince = diffDays;
        }
      }
    });

    if (maxRemaining > 0) {
      isEligible = false;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* ── Header ─────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isEligible ? '✅ You\'re eligible to donate today!' : `⏳ Next eligible: ${nextDate?.toLocaleDateString()}`}
          </p>
        </div>
        {isEligible ? (
          <Link to="/donor/appointments/new" style={{
            padding: '0.625rem 1.25rem',
            background: 'var(--accent)', color: 'white',
            borderRadius: '0.75rem', textDecoration: 'none',
            fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 0 18px var(--accent-glow)',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
          >
            <HiOutlineCalendar style={{ width: '1rem', height: '1rem' }} />
            Book Appointment
          </Link>
        ) : (
          <div style={{
            padding: '0.625rem 1.25rem',
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '0.75rem',
            color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600,
          }}>
            🗓 Eligible {nextDate?.toLocaleDateString()}
          </div>
        )}
      </div>

      {/* ── Stats ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatsCard title="Total Donations"   value={myProfile?.totalDonations || 0}   icon={HiOutlineHeart}        color="red"    />
        <StatsCard title="Upcoming Appts"    value={upcoming.length}                   icon={HiOutlineCalendar}     color="blue"   />
        <StatsCard title="Days Since Last"   value={daysSince ?? '—'}                  icon={HiOutlineClock}        color="purple" />
        <StatsCard title="Eligibility"       value={isEligible ? 'Eligible' : 'Wait'} icon={HiOutlineCheckCircle}  color={isEligible ? 'green' : 'amber'} />
      </div>

      {/* ── Main grid ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {/* Profile card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Donor Profile</h3>
              {myProfile?.bloodGroup && <BloodGroupBadge group={myProfile.bloodGroup} size="md" />}
            </div>
            {myProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <Row label="Email"     value={myProfile.email}  />
                <Row label="Phone"     value={myProfile.phone}  />
                <Row label="Blood Group" value={myProfile.bloodGroup} />
                <Row label="Weight"    value={myProfile.weight ? `${myProfile.weight} kg` : null} />
                <Row label="Status"    value={myProfile.status} />
                <Link to="/donor/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  Edit Profile <HiOutlineArrowRight style={{ width: '0.85rem', height: '0.85rem' }} />
                </Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Profile incomplete</p>
                <Link to="/donor/profile/edit" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>Complete Profile →</Link>
              </div>
            )}
          </div>

          {/* Eligibility visual */}
          <div style={{
            background: isEligible ? 'rgba(74,222,128,0.05)' : 'rgba(251,191,36,0.05)',
            border: `1px solid ${isEligible ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`,
            borderRadius: '1.25rem', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            textAlign: 'center', gap: '0.75rem',
          }}>
            <div style={{ fontSize: '3rem' }}>{isEligible ? '✅' : '⏳'}</div>
            <h3 style={{ color: isEligible ? '#4ade80' : '#fbbf24', fontWeight: 800, fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              {isEligible ? 'Ready to Donate!' : 'Recovery Period'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              {isEligible
                ? 'Your waiting period has passed. Book an appointment now!'
                : `You donated ${activeCompName} ${daysSince} days ago. Rest up — ${maxRemaining} more days to go.`}
            </p>
            {isEligible && (
              <Link to="/donor/appointments/new" style={{
                padding: '0.6rem 1.25rem', background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80',
                borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
              }}>
                Book Now →
              </Link>
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Upcoming Appointments</h3>
            <Link to="/donor/appointments" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>View All →</Link>
          </div>
          {upcoming.length > 0 ? (
            <ul style={{ listStyle: 'none' }}>
              {upcoming.map(apt => (
                <li key={apt._id} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.15s',
                  flexWrap: 'wrap', gap: '0.5rem',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Donation Appointment</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      📅 {new Date(apt.date).toLocaleDateString()} &nbsp;·&nbsp; 🕐 {apt.timeSlot}
                    </p>
                    {apt.location && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>📍 {apt.location}</p>}
                  </div>
                  <StatusBadge status={apt.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No upcoming appointments</p>
              <Link to="/donor/appointments/new" style={{ display: 'inline-block', marginTop: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                Schedule one now →
              </Link>
            </div>
          )}
        </div>

        {/* Recent donations table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Recent Donations</h3>
            <Link to="/donor/donations" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>Full History →</Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <TH c="Donation ID" /><TH c="Date" /><TH c="Quantity" /><TH c="Status" />
                </tr>
              </thead>
              <tbody>
                {myDonations?.slice(0, 5).map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <TD mono>{d.donationId}</TD>
                    <TD>{new Date(d.donationDate).toLocaleDateString()}</TD>
                    <TD>{d.quantity} Units</TD>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {(!myDonations?.length) && (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No donation history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
