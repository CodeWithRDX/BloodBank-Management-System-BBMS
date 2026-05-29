import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAppointment, fetchMyAppointments } from '../redux/slices/appointmentSlice';
import { fetchPublicBranches } from '../redux/slices/branchSlice';
import { fetchMyRegistrations } from '../redux/slices/campSlice';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const TIME_SLOTS = ['09:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','14:00-15:00','15:00-16:00','16:00-17:00'];

const iStyle = { width: '100%', padding: '0.7rem 0.875rem', fontSize: '0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', boxSizing: 'border-box' };
const Lbl = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{children}</label>
);

const NewAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, myAppointments } = useSelector(s => s.appointments);
  const { publicBranches } = useSelector(s => s.branches);
  const { myRegistrations } = useSelector(s => s.camps);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({ date: minDate, timeSlot: '09:00-10:00', type: 'donation', component: 'whole_blood', branchId: '', notes: '' });

  useEffect(() => {
    dispatch(fetchPublicBranches());
    dispatch(fetchMyAppointments());
    dispatch(fetchMyRegistrations());
  }, [dispatch]);

  useEffect(() => {
    if (publicBranches && publicBranches.length > 0 && !form.branchId) {
      setForm(prev => ({ ...prev, branchId: publicBranches[0]._id }));
    }
  }, [publicBranches, form.branchId]);

  // Check rules
  const activeAppointment = myAppointments?.find(apt => ['Pending', 'Approved', 'Ongoing'].includes(apt.status));
  const pendingCamp = myRegistrations?.find(reg => reg.status === 'Pending Approval');
  const isBlocked = !!activeAppointment || !!pendingCamp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) {
      toast.error('You cannot book an appointment at this time.');
      return;
    }
    const res = await dispatch(createAppointment(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Appointment booked successfully!');
      navigate('/donor');
    } else {
      toast.error(res.payload || 'Failed to book appointment');
    }
  };

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <HiOutlineArrowLeft style={{ width: '1.1rem', height: '1.1rem' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Book Appointment
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Schedule your next blood donation visit</p>
        </div>
      </div>

      {/* Warning Panel */}
      {isBlocked && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '1rem',
          padding: '1.25rem',
          color: '#ef4444',
          fontSize: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            ⚠️ Booking Restricted
          </strong>
          {activeAppointment && (
            <p style={{ margin: 0 }}>
              You currently have an active appointment (status: <strong>{activeAppointment.status}</strong>) scheduled on <strong>{new Date(activeAppointment.date).toLocaleDateString()}</strong> at <strong>{activeAppointment.timeSlot}</strong>. Please complete or cancel it before booking a new one.
            </p>
          )}
          {pendingCamp && (
            <p style={{ margin: 0 }}>
              You have a pending donation camp registration for <strong>{pendingCamp.campId?.name || 'a camp'}</strong>. Please wait for it to be resolved or cancelled first.
            </p>
          )}
        </div>
      )}

      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--glass-shadow)', opacity: isBlocked ? 0.65 : 1, pointerEvents: isBlocked ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Branch */}
          <div>
            <Lbl>Select Blood Bank Branch</Lbl>
            <select name="branchId" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} style={iStyle} required>
              <option value="" disabled>-- Select a Branch --</option>
              {publicBranches && publicBranches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.address?.city || 'Unknown'})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <Lbl>Appointment Date</Lbl>
            <input type="date" name="date" min={minDate} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={iStyle} />
          </div>

          {/* Time slots */}
          <div>
            <Lbl>Select Time Slot</Lbl>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.625rem' }}>
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot} type="button"
                  onClick={() => setForm({ ...form, timeSlot: slot })}
                  style={{
                    padding: '0.625rem 0.5rem', borderRadius: '0.625rem', cursor: 'pointer',
                    border: `2px solid ${form.timeSlot === slot ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.timeSlot === slot ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    color: form.timeSlot === slot ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '0.82rem', fontWeight: form.timeSlot === slot ? 700 : 500,
                    transition: 'all 0.15s', fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  🕐 {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Component Type */}
          <div>
            <Lbl>Donation Component</Lbl>
            <select name="component" value={form.component} onChange={e => setForm({ ...form, component: e.target.value })} style={iStyle}>
              <option value="whole_blood">Whole Blood (90 Days Cooldown)</option>
              <option value="platelets">Platelets (14 Days Cooldown)</option>
              <option value="plasma">Plasma (28 Days Cooldown)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Lbl>Additional Notes (Optional)</Lbl>
            <textarea name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any special notes for the team…" style={{ ...iStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Preview */}
          {form.date && form.timeSlot && form.branchId && (
            <div style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: '0.875rem', padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📋 <strong style={{ color: 'var(--text-primary)' }}>Summary:</strong>{' '}
              {new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} at {form.timeSlot}, {publicBranches?.find(b => b._id === form.branchId)?.name || 'Selected Center'} ({form.component.replace('_', ' ')})
            </div>
          )}

          {/* Submit */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" disabled={loading || isBlocked} className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: (loading || isBlocked) ? 'not-allowed' : 'pointer', opacity: (loading || isBlocked) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading
                ? <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />Confirming…</>
                : '✅ Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NewAppointment;
