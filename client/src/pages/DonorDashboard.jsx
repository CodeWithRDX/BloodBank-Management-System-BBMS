import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonorProfile, fetchMyDonations } from '../redux/slices/donorSlice';
import { fetchMyAppointments } from '../redux/slices/appointmentSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../theme/ThemeContext';
import {
  HiOutlineHeart, HiOutlineCalendar, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineArrowRight,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import usePolling from '../hooks/usePolling';

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>
      {label}
    </span>
    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{value || '—'}</span>
  </div>
);

const TH = ({ c }) => (
  <th style={{
    padding: '0.875rem 1.25rem',
    color: 'var(--text-secondary)',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-display)'
  }}>
    {c}
  </th>
);

const TD = ({ children, mono }) => (
  <td style={{
    padding: '0.875rem 1.25rem',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: mono ? 'monospace' : undefined,
    fontWeight: 500
  }}>
    {children}
  </td>
);

const DonorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myProfile, myDonations, loading: dL } = useSelector(s => s.donors);
  const { myAppointments, loading: aL } = useSelector(s => s.appointments);
  const { theme } = useTheme();
  const isAnime = theme?.group === 'anime';

  usePolling(() => {
    dispatch(fetchMyDonorProfile());
    dispatch(fetchMyDonations());
    dispatch(fetchMyAppointments());
  }, 10000);

  if ((dL || aL) && !myProfile) return <LoadingSpinner size="lg" text="Loading your clinical donor logs..." />;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fadeIn">
      
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px dashed var(--border)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-display)',
            textTransform: (theme?.id === 'titan' || theme?.id === 'dragonball') ? 'uppercase' : 'none'
          }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isEligible ? '🟢 Verified status: Eligible to donate today!' : `⏳ Wait period: Next eligible date is ${nextDate?.toLocaleDateString()}`}
          </p>
        </div>

        <div>
          {isEligible ? (
            <Link
              to="/donor/appointments/new"
              className="btn-primary animate-pulseGlow"
              style={{
                padding: '0.625rem 1.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <HiOutlineCalendar style={{ width: '1.1rem', height: '1.1rem' }} />
              Schedule Donation
            </Link>
          ) : (
            <div style={{
              padding: '0.625rem 1.5rem',
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.35)',
              borderRadius: 'var(--btn-radius)',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)'
            }}>
              🗓️ Elligible on {nextDate?.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: '1.25rem' }}>
        <StatsCard title="Completed Donations" value={myProfile?.totalDonations || 0} icon={HiOutlineHeart} color="red" />
        <StatsCard title="Active Appointments" value={upcoming.length} icon={HiOutlineCalendar} color="blue" />
        <StatsCard title="Days Since Last Draw" value={daysSince ?? '—'} icon={HiOutlineClock} color="purple" />
        <StatsCard title="Clinical Standing" value={isEligible ? 'Eligible' : 'Recovering'} icon={HiOutlineCheckCircle} color={isEligible ? 'green' : 'amber'} />
      </div>

      {/* Split Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          
          {/* Profile details */}
          <div
            className={isAnime ? 'anime-card' : 'card'}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Donor Standing Card</h3>
                {myProfile?.bloodGroup && <BloodGroupBadge group={myProfile.bloodGroup} size="md" />}
              </div>
              {myProfile ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <Row label="Account Email" value={myProfile.email} />
                  <Row label="Mobile Phone" value={myProfile.phone} />
                  <Row label="Blood Group" value={myProfile.bloodGroup} />
                  <Row label="Body Weight" value={myProfile.weight ? `${myProfile.weight} kg` : '—'} />
                  <Row label="Clinic Standing" value={myProfile.status} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Clinical Profile Incomplete</p>
                  <Link to="/donor/profile" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Complete Profile</Link>
                </div>
              )}
            </div>

            {myProfile && (
              <Link
                to="/donor/profile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginTop: '1.5rem',
                  fontFamily: 'var(--font-display)'
                }}
              >
                Update Profile Settings <HiOutlineArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
              </Link>
            )}
          </div>

          {/* Eligibility Card */}
          <div
            className="glass-premium animate-borderPulse"
            style={{
              border: `1px solid ${isEligible ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
              borderRadius: '1.5rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
              boxShadow: 'var(--card-shadow)',
              minHeight: '220px'
            }}
          >
            <div style={{ fontSize: '3.5rem', filter: `drop-shadow(0 0 10px ${isEligible ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)'})` }}>
              {isEligible ? '🩸' : '⏳'}
            </div>
            <h3 style={{
              color: isEligible ? '#4ade80' : '#fbbf24',
              fontWeight: 800,
              fontSize: '1.35rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              textShadow: isEligible ? '0 0 10px rgba(74,222,128,0.3)' : '0 0 10px rgba(251,191,36,0.3)'
            }}>
              {isEligible ? 'Ready to Donate Blood!' : 'Recovery Period Active'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '20rem' }}>
              {isEligible
                ? 'Your interval recovery cooldown has completely cleared. Book an appointment today and save lives!'
                : `You made a ${activeCompName} donation ${daysSince} days ago. Clinical protocol requires ${maxRemaining} more recovery days.`}
            </p>
            {isEligible && (
              <Link
                to="/donor/appointments/new"
                className="btn-primary"
                style={{
                  textDecoration: 'none',
                  padding: '0.5rem 1.5rem',
                  fontSize: '0.82rem',
                  marginTop: '0.5rem'
                }}
              >
                Schedule Walk-in Now
              </Link>
            )}
          </div>
        </div>

        {/* Upcoming appointments list */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>Upcoming Appointments</h3>
            <Link to="/donor/appointments" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>View All List</Link>
          </div>
          {upcoming.length > 0 ? (
            <ul style={{ listStyle: 'none' }}>
              {upcoming.map(apt => (
                <li
                  key={apt._id}
                  className="table-row"
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>Whole Blood Donation</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      📅 {new Date(apt.date).toLocaleDateString()} &nbsp;·&nbsp; ⏱️ Time Slot: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{apt.timeSlot}</span>
                    </p>
                    {apt.location && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>📍 {apt.location}</p>}
                  </div>
                  <StatusBadge status={apt.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>No upcoming scheduled appointments</p>
              <Link to="/donor/appointments/new" style={{ display: 'inline-block', marginTop: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
                Book one today →
              </Link>
            </div>
          )}
        </div>

        {/* Donation history table */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>Recent Donation Records</h3>
            <Link to="/donor/donations" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Full History List</Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  <TH c="Donation SOS ID" />
                  <TH c="Date of Draw" />
                  <TH c="Quantity drawn" />
                  <TH c="Record Status" />
                </tr>
              </thead>
              <tbody>
                {myDonations?.slice(0, 5).map(d => (
                  <tr key={d._id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <TD mono>{d.donationId}</TD>
                    <TD>{new Date(d.donationDate).toLocaleDateString()}</TD>
                    <TD>{d.quantity} Units</TD>
                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {(!myDonations?.length) && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                      No past donation records found on file.
                    </td>
                  </tr>
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
