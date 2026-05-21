import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../redux/slices/requestSlice';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const BG = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const iStyle = {
  width: '100%', padding: '0.7rem 0.875rem', fontSize: '0.875rem',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: '0.625rem', color: 'var(--text-primary)', boxSizing: 'border-box',
};
const Lbl = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
    {children}
  </label>
);

const URGENCY_CONFIG = {
  normal:    { emoji: '🟢', label: 'Normal',    desc: 'Standard processing',   color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)'  },
  urgent:    { emoji: '🟡', label: 'Urgent',    desc: 'Required within 24h',   color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.3)'  },
  emergency: { emoji: '🔴', label: 'Emergency', desc: 'Immediate — life risk', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)' },
};

const NewBloodRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.requests);
  const [form, setForm] = useState({ patientName: '', bloodGroup: 'A+', quantity: 1, urgency: 'normal', reason: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createRequest(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Blood request submitted!');
      navigate('/hospital');
    } else toast.error(res.payload || 'Failed to create request');
  };

  return (
    <div style={{ maxWidth: '44rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
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
            New Blood Request
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Submit a request for blood units from the central inventory
          </p>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--card-shadow)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Patient info row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Lbl>Patient Full Name</Lbl>
              <input type="text" name="patientName" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required placeholder="e.g. Raushan Kumar" style={iStyle} />
            </div>
            <div>
              <Lbl>Required Blood Group</Lbl>
              <select name="bloodGroup" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} style={iStyle}>
                {BG.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Lbl>Quantity (Units)</Lbl>
              <input type="number" min="1" max="20" name="quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required style={iStyle} />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <Lbl>Urgency Level</Lbl>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {Object.entries(URGENCY_CONFIG).map(([level, cfg]) => (
                <label key={level} style={{
                  padding: '1rem', borderRadius: '0.875rem', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${form.urgency === level ? cfg.color : 'var(--border)'}`,
                  background: form.urgency === level ? cfg.bg : 'var(--bg-elevated)',
                  transition: 'all 0.2s',
                }}>
                  <input type="radio" name="urgency" value={level} checked={form.urgency === level} onChange={e => setForm({ ...form, urgency: e.target.value })} style={{ display: 'none' }} />
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{cfg.emoji}</div>
                  <p style={{ color: form.urgency === level ? cfg.color : 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>{cfg.label}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{cfg.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <Lbl>Medical Reason / Condition</Lbl>
            <input type="text" name="reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required placeholder="e.g. Surgery, Accident, Anaemia" style={iStyle} />
          </div>

          {/* Notes */}
          <div>
            <Lbl>Additional Notes (Optional)</Lbl>
            <textarea name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any special requirements or details…" style={{ ...iStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding: '0.75rem 2.5rem', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading
                ? <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />Submitting…</>
                : '🩸 Submit Request'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NewBloodRequest;
