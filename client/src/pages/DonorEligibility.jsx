import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonorProfile } from '../redux/slices/donorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import { FiCheckCircle, FiClock, FiActivity, FiShield, FiAlertOctagon } from 'react-icons/fi';

const COMPONENTS_CONFIG = [
  {
    key: 'whole_blood',
    name: 'Whole Blood',
    cooldownDays: 90,
    icon: '🩸',
    description: 'The most common type of donation, where you give whole blood. It is usually used for surgeries and trauma.',
    lastDateKey: 'lastDonationDate',
    color: '#ef4444'
  },
  {
    key: 'platelets',
    name: 'Platelets (Apheresis)',
    cooldownDays: 14,
    icon: '✨',
    description: 'Platelets are tiny cells that help blood clot. Essential for cancer patients undergoing chemotherapy.',
    lastDateKey: 'lastPlateletDonationDate',
    color: '#3b82f6'
  },
  {
    key: 'plasma',
    name: 'Plasma',
    cooldownDays: 28,
    icon: '🟡',
    description: 'Plasma is the liquid portion of blood used to treat burn victims, trauma, and rare diseases.',
    lastDateKey: 'lastPlasmaDonationDate',
    color: '#f59e0b'
  }
];

export default function DonorEligibility() {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((s) => s.donors);

  useEffect(() => {
    dispatch(fetchMyDonorProfile());
  }, [dispatch]);

  const getCooldownInfo = (component) => {
    if (!myProfile) return { eligible: true, daysRemaining: 0 };
    const lastDateVal = myProfile[component.lastDateKey];
    if (!lastDateVal) return { eligible: true, daysRemaining: 0 };

    const lastDate = new Date(lastDateVal);
    const now = new Date();
    const diffTime = Math.abs(now - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = component.cooldownDays - diffDays;

    const nextEligibleDate = new Date(lastDate.getTime() + component.cooldownDays * 24 * 60 * 60 * 1000);

    return {
      eligible: diffDays >= component.cooldownDays,
      daysRemaining: remaining > 0 ? remaining : 0,
      lastDonated: lastDate,
      nextEligibleDate
    };
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing eligibility logs..." />;
  }

  if (!myProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
        <FiAlertOctagon style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Donor profile not found. Please complete your donor profile registration first.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fadeIn">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
          🛡️ Donation Eligibility
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
          Check your component-specific donation eligibility cooldown timers and guidelines
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '50%',
            background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)'
          }}>
            {myProfile.fullName ? myProfile.fullName.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {myProfile.fullName}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weight: <strong>{myProfile.weight} kg</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Donations: <strong>{myProfile.totalDonations}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BLOOD GROUP</span>
            <BloodGroupBadge group={myProfile.bloodGroup} size="md" />
          </div>
        </div>
      </div>

      {/* Component Specific Cooldown Trackers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {COMPONENTS_CONFIG.map((comp) => {
          const info = getCooldownInfo(comp);

          return (
            <div
              key={comp.key}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: `4px solid ${comp.color}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.5rem' }}>{comp.icon}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {comp.name}
                  </h3>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: info.eligible ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: info.eligible ? '#10b981' : '#f59e0b',
                  border: `1px solid ${info.eligible ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                }}>
                  {info.eligible ? 'ELIGIBLE' : 'COOLDOWN'}
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {comp.description}
              </p>

              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 10,
                padding: '1rem',
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {info.eligible ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    <FiCheckCircle style={{ fontSize: '1.1rem' }} />
                    You are eligible to donate {comp.name.toLowerCase()}!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                      <FiClock style={{ fontSize: '1.1rem' }} />
                      Cooldown: {info.daysRemaining} Days Remaining
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Eligible again on: <strong>{info.nextEligibleDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Last Donated:</span>
                  <strong>{info.lastDonated ? info.lastDonated.toLocaleDateString() : 'Never'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Cooldown Required:</span>
                  <strong>{comp.cooldownDays} Days</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidelines Accordion card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiShield style={{ color: 'var(--accent)' }} /> Blood Donor Guidelines
        </h3>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: '1.2rem', margin: 0 }}>
          <li><strong>Age:</strong> Must be between 18 and 65 years old.</li>
          <li><strong>Weight:</strong> Must weigh at least 45 kg (99 lbs).</li>
          <li><strong>Hemoglobin:</strong> Minimum level of 12.5 g/dL.</li>
          <li><strong>Health:</strong> Must be in good health at the time of donation. Should not have had tattoos or piercings in the last 6 months.</li>
          <li><strong>Medication:</strong> Must not be taking certain medications like antibiotics at the time of donation.</li>
        </ul>
      </div>
    </div>
  );
}
