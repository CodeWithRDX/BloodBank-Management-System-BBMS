import { useEffect, useState } from 'react';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDonorProfile, updateDonor } from '../redux/slices/donorSlice';
import { updateProfile, updatePassword } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import toast from 'react-hot-toast';
import API from '../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ryker',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Buster',
];

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
  
  const isDonor = user?.role === 'donor';

  const [form, setForm] = useState({
    fullName: '', phone: '', gender: 'male', bloodGroup: 'O+', dateOfBirth: '', weight: '',
    address: { street: '', city: '', state: '', zipCode: '' }, medicalHistory: '', avatar: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => { 
    if (isDonor && !myProfile) {
      dispatch(fetchMyDonorProfile()); 
    }
  }, [dispatch, myProfile, isDonor]);

  useEffect(() => {
    if (user) {
      if (isDonor && myProfile) {
        setForm({
          fullName:      myProfile.fullName || user.name || '',
          phone:         myProfile.phone || user.phone || '',
          gender:        myProfile.gender || 'male',
          bloodGroup:    myProfile.bloodGroup || 'O+',
          dateOfBirth:   myProfile.dateOfBirth ? new Date(myProfile.dateOfBirth).toISOString().split('T')[0] : '',
          weight:        myProfile.weight || '',
          address:       myProfile.address || { street: '', city: '', state: '', zipCode: '' },
          medicalHistory: myProfile.medicalHistory || '',
          avatar:         user.avatar || '',
        });
      } else if (!isDonor) {
        setForm(prev => ({
          ...prev,
          fullName: user.name || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
        }));
      }
    }
  }, [myProfile, user, isDonor]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const f = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [f]: value } });
    } else setForm({ ...form, [name]: value });
  };

  const handlePasswordChange = e => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const toastId = toast.loading('Uploading avatar...');
    try {
      const { data } = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, avatar: data.avatar }));
      
      // Update local storage and redux state with new avatar
      const updatedUser = { ...user, avatar: data.avatar };
      dispatch({ type: 'auth/updateProfile/fulfilled', payload: { data: updatedUser } });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar', { id: toastId });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    const toastId = toast.loading('Updating password...');
    const resultAction = await dispatch(updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }));
    if (updatePassword.fulfilled.match(resultAction)) {
      toast.success('🎉 Password updated successfully!', { id: toastId });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } else {
      toast.error(resultAction.payload || 'Failed to update password', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDonor && myProfile) {
      const res = await dispatch(updateDonor({ id: myProfile._id, donorData: form }));
      await dispatch(updateProfile({ name: form.fullName, phone: form.phone, avatar: form.avatar })).unwrap();
      if (res.meta.requestStatus === 'fulfilled') toast.success('Profile saved!');
      else toast.error(res.payload || 'Failed to update profile');
    } else {
      try {
        await dispatch(updateProfile({ name: form.fullName, phone: form.phone, avatar: form.avatar })).unwrap();
        toast.success('Profile saved!');
      } catch (err) {
        toast.error(err || 'Failed to update profile');
      }
    }
  };

  const showLoading = isDonor && loading && !myProfile;
  if (showLoading) return <LoadingSpinner size="lg" />;

  const isLocalAccount = user?.oauthProvider === 'local' || !user?.oauthProvider;

  return (
    <div style={{ maxWidth: '50rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', flexShrink: 0, overflow: 'hidden',
          boxShadow: '0 0 16px var(--accent-glow)'
        }}>
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '🧑‍⚕️'
          )}
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Profile Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{user?.email}</p>
            {isDonor && myProfile?.bloodGroup && <BloodGroupBadge group={myProfile.bloodGroup} size="sm" />}
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--card-shadow)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Avatar Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <Lbl>Profile Avatar</Lbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '50%',
                background: 'var(--bg-elevated)', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)',
                overflow: 'hidden'
              }}>
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload-file').click()}
                    style={{
                      padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                      background: 'var(--accent)', border: 'none', borderRadius: '0.5rem',
                      color: 'white', cursor: 'pointer'
                    }}
                  >
                    📤 Upload Photo
                  </button>
                  {form.avatar && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, avatar: '' }))}
                      style={{
                        padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                        background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem',
                        color: 'var(--text-secondary)', cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  id="avatar-upload-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  PNG, JPG or GIF up to 5MB.
                </p>
              </div>
            </div>

            <div>
              <Lbl>Select from Avatar Presets</Lbl>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(3.2rem, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                {PRESET_AVATARS.map((url, index) => {
                  const selected = form.avatar === url;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, avatar: url }))}
                      style={{
                        width: '3.2rem', height: '3.2rem', borderRadius: '50%',
                        background: 'var(--bg-elevated)', border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        padding: '0.2rem', cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: selected ? '0 0 10px var(--accent-glow)' : 'none',
                        overflow: 'hidden'
                      }}
                    >
                      <img src={url} alt={`Preset ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Personal */}
          <Section title="👤 Personal Information">
            <Field><Lbl>Full Name</Lbl><input name="fullName" value={form.fullName} onChange={handleChange} required style={iStyle} /></Field>
            <Field>
              <Lbl>Phone Number</Lbl>
              <PhoneInput
                country={'in'}
                value={form.phone}
                onChange={phone => setForm({ ...form, phone })}
                inputStyle={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.625rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  paddingLeft: '48px'
                }}
                buttonStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderTopLeftRadius: '0.625rem',
                  borderBottomLeftRadius: '0.625rem',
                }}
                dropdownStyle={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              />
            </Field>
            {isDonor && (
              <>
                <Field>
                  <Lbl>Gender</Lbl>
                  <select name="gender" value={form.gender} onChange={handleChange} style={iStyle}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field><Lbl>Date of Birth</Lbl><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required style={iStyle} /></Field>
              </>
            )}
          </Section>

          {/* Medical (Donors only) */}
          {isDonor && (
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
          )}

          {/* Address (Donors only) */}
          {isDonor && (
            <Section title="📍 Address">
              <div style={{ gridColumn: '1 / -1' }}>
                <Lbl>Street Address</Lbl>
                <input name="address.street" value={form.address.street} onChange={handleChange} placeholder="123 Main Street" style={iStyle} />
              </div>
              <Field><Lbl>City</Lbl><input name="address.city" value={form.address.city} onChange={handleChange} style={iStyle} /></Field>
              <Field><Lbl>State</Lbl><input name="address.state" value={form.address.state} onChange={handleChange} style={iStyle} /></Field>
              <Field><Lbl>ZIP Code</Lbl><input name="address.zipCode" value={form.address.zipCode} onChange={handleChange} style={iStyle} /></Field>
            </Section>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" className="btn-primary"
              style={{ padding: '0.75rem 2rem', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Inline Form Section (Local Accounts Only) */}
      {isLocalAccount && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--card-shadow)' }}>
          <h3 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{ 
              color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              cursor: 'pointer', userSelect: 'none'
            }}
          >
            <span>🔑 Security & Change Password</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{showPasswordForm ? 'Hide ▲' : 'Show ▼'}</span>
          </h3>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <Field>
                  <Lbl>Current Password</Lbl>
                  <input 
                    type="password" name="currentPassword" required 
                    value={passwordForm.currentPassword} onChange={handlePasswordChange}
                    placeholder="••••••••" style={iStyle} 
                  />
                </Field>
                <Field>
                  <Lbl>New Password</Lbl>
                  <input 
                    type="password" name="newPassword" required 
                    value={passwordForm.newPassword} onChange={handlePasswordChange}
                    placeholder="••••••••" style={iStyle} 
                  />
                </Field>
                <Field>
                  <Lbl>Confirm New Password</Lbl>
                  <input 
                    type="password" name="confirmPassword" required 
                    value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                    placeholder="••••••••" style={iStyle} 
                  />
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="submit" className="btn-primary" 
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DonorProfile;
