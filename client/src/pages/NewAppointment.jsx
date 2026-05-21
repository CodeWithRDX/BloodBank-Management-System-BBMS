import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../redux/slices/appointmentSlice';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const TIME_SLOTS = ['09:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','14:00-15:00','15:00-16:00','16:00-17:00'];
const LOCATIONS  = ['Main Blood Bank Center','City Hospital Branch','Mobile Donation Camp (Downtown)'];

const iStyle = { width: '100%', padding: '0.7rem 0.875rem', fontSize: '0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', boxSizing: 'border-box' };
const Lbl = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{children}</label>
);

const NewAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.appointments);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({ date: minDate, timeSlot: '09:00-10:00', type: 'donation', component: 'whole_blood', location: 'Main Blood Bank Center', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createAppointment(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Appointment booked!');
      navigate('/donor');
    } else toast.error(res.payload || 'Failed to book appointment');
  };

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.15s' }}
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

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--card-shadow)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

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

          {/* Location */}
          <div>
            <Lbl>Donation Center</Lbl>
            <select name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={iStyle}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
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
          {form.date && form.timeSlot && (
            <div style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: '0.875rem', padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📋 <strong style={{ color: 'var(--text-primary)' }}>Summary:</strong>{' '}
              {new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} at {form.timeSlot}, {form.location} ({form.component.replace('_', ' ')})
            </div>
          )}

          {/* Submit */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
