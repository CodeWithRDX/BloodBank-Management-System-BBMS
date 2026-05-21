import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonorProfile, updateDonor } from '../redux/slices/donorSlice';
import { updateProfile } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Lbl = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
    {children}
  </label>
);
const Field = ({ children }) => <div>{children}</div>;
const iStyle = { width: '100%', padding: '0.7rem 0.875rem', fontSize: '0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', boxSizing: 'border-box' };
const Section = ({ title, children }) => (
  <div>
    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {title}
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {children}
    </div>
  </div>
);

const DonorProfile = () => {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector(s => s.donors);
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({
    fullName: '', phone: '', gender: 'male', bloodGroup: 'O+', dateOfBirth: '', weight: '',
    address: { street: '', city: '', state: '', zipCode: '' }, medicalHistory: ''
  });

  useEffect(() => { if (!myProfile) dispatch(fetchMyDonorProfile()); }, [dispatch, myProfile]);

  useEffect(() => {
    if (myProfile) {
      setForm({
        fullName:      myProfile.fullName || user?.name || '',
        phone:         myProfile.phone || user?.phone || '',
        gender:        myProfile.gender || 'male',
        bloodGroup:    myProfile.bloodGroup || 'O+',
        dateOfBirth:   myProfile.dateOfBirth ? new Date(myProfile.dateOfBirth).toISOString().split('T')[0] : '',
        weight:        myProfile.weight || '',
        address:       myProfile.address || { street: '', city: '', state: '', zipCode: '' },
        medicalHistory: myProfile.medicalHistory || '',
      });
    }
  }, [myProfile, user]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const f = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [f]: value } });
    } else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateDonor({ id: myProfile._id, donorData: form }));
    await dispatch(updateProfile({ name: form.fullName, phone: form.phone }));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Profile saved!');
    else toast.error(res.payload || 'Failed to update profile');
  };

  if (loading && !myProfile) return <LoadingSpinner size="lg" />;

  return (
    <div style={{ maxWidth: '50rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%',
          background: 'var(--accent-soft)', border: '2px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', flexShrink: 0,
        }}>
          🧑‍⚕️
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Profile Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{user?.email}</p>
            {myProfile?.bloodGroup && <BloodGroupBadge group={myProfile.bloodGroup} size="sm" />}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--card-shadow)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Personal */}
          <Section title="👤 Personal Information">
            <Field><Lbl>Full Name</Lbl><input name="fullName" value={form.fullName} onChange={handleChange} required style={iStyle} /></Field>
            <Field><Lbl>Phone Number</Lbl><input type="tel" name="phone" value={form.phone} onChange={handleChange} required style={iStyle} /></Field>
            <Field>
              <Lbl>Gender</Lbl>
              <select name="gender" value={form.gender} onChange={handleChange} style={iStyle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field><Lbl>Date of Birth</Lbl><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required style={iStyle} /></Field>
          </Section>

          {/* Medical */}
          <Section title="🩸 Medical Details">
            <Field>
              <Lbl>Blood Group</Lbl>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} style={iStyle}>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field><Lbl>Weight (kg)</Lbl><input type="number" min="45" name="weight" value={form.weight} onChange={handleChange} required style={iStyle} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Lbl>Medical History / Chronic Illnesses</Lbl>
              <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows={3} placeholder="Describe any relevant medical conditions…" style={{ ...iStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
          </Section>

          {/* Address */}
          <Section title="📍 Address">
            <div style={{ gridColumn: '1 / -1' }}>
              <Lbl>Street Address</Lbl>
              <input name="address.street" value={form.address.street} onChange={handleChange} placeholder="123 Main Street" style={iStyle} />
            </div>
            <Field><Lbl>City</Lbl><input name="address.city" value={form.address.city} onChange={handleChange} style={iStyle} /></Field>
            <Field><Lbl>State</Lbl><input name="address.state" value={form.address.state} onChange={handleChange} style={iStyle} /></Field>
            <Field><Lbl>ZIP Code</Lbl><input name="address.zipCode" value={form.address.zipCode} onChange={handleChange} style={iStyle} /></Field>
          </Section>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '0.75rem 2rem', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? (
                <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />Saving…</>
              ) : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DonorProfile;
