import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments } from '../redux/slices/appointmentSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import BloodGroupBadge from '../components/BloodGroupBadge';
import API from '../api/axios';
import toast from 'react-hot-toast';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;

import usePolling from '../hooks/usePolling';

const TH = ({ c, right }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, total, loading } = useSelector(s => s.appointments);
  const [statusFilter, setStatusFilter] = useState('');

  const refresh = () => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    dispatch(fetchAllAppointments(p.toString()));
  };

  usePolling(refresh, 10000, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}!`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const [verifyAptId, setVerifyAptId] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
    weight: '',
    idType: 'Aadhaar',
    idNumber: '',
    isVerified: true,
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  const handleCompleteClick = (apt) => {
    const donor = apt.donorId || {};
    setVerifyForm({
      gender: donor.gender || '',
      bloodGroup: donor.bloodGroup || '',
      dateOfBirth: donor.dateOfBirth ? new Date(donor.dateOfBirth).toISOString().split('T')[0] : '',
      weight: donor.weight || '',
      idType: donor.governmentId?.idType || 'Aadhaar',
      idNumber: donor.governmentId?.idNumber || '',
      isVerified: donor.governmentId?.isVerified ?? true,
      emergencyName: donor.emergencyContact?.name || '',
      emergencyPhone: donor.emergencyContact?.phone || '',
      emergencyRelation: donor.emergencyContact?.relation || '',
    });
    setVerifyAptId(apt);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyForm.gender || !verifyForm.bloodGroup || !verifyForm.dateOfBirth || !verifyForm.weight || !verifyForm.idType || !verifyForm.idNumber || !verifyForm.emergencyName || !verifyForm.emergencyPhone || !verifyForm.emergencyRelation) {
      return toast.error('All verification fields are required.');
    }
    
    const birthDate = new Date(verifyForm.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return toast.error('Donor must be at least 18 years old.');
    }

    if (parseFloat(verifyForm.weight) < 45) {
      return toast.error('Donor weight must be at least 45 kg.');
    }

    try {
      await API.put(`/donors/${verifyAptId.donorId._id}`, {
        gender: verifyForm.gender,
        bloodGroup: verifyForm.bloodGroup,
        dateOfBirth: verifyForm.dateOfBirth,
        weight: parseFloat(verifyForm.weight),
        governmentId: {
          idType: verifyForm.idType,
          idNumber: verifyForm.idNumber,
          isVerified: verifyForm.isVerified
        },
        emergencyContact: {
          name: verifyForm.emergencyName,
          phone: verifyForm.emergencyPhone,
          relation: verifyForm.emergencyRelation
        }
      });

      await handleStatusChange(verifyAptId._id, 'Completed');
      setVerifyAptId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update donor verification info.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {total} total donation appointments
          </p>
        </div>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>📅</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Space Grotesk', sans-serif" }}>{total} Total</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {['', 'Pending', 'Approved', 'Rejected', 'Ongoing', 'Completed', 'Cancelled', 'Missed'].map(s => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)} style={{
            padding: '0.35rem 0.875rem', borderRadius: '999px',
            border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
            background: statusFilter === s ? 'var(--accent)' : 'var(--bg-surface)',
            color: statusFilter === s ? 'white' : 'var(--text-secondary)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? <LoadingSpinner text="Loading appointments…" /> : (
          <table style={{ borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}>
                <TH c="Donor" /><TH c="Group" /><TH c="Date" /><TH c="Time" /><TH c="Branch" /><TH c="Status" /><TH c="Actions" right />
              </tr></thead>
              <tbody>
                {appointments?.map(apt => (
                  <tr key={apt._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{apt.donorId?.fullName || apt.userId?.name || 'Unknown'}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{apt.userId?.email}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {apt.donorId?.bloodGroup ? <BloodGroupBadge group={apt.donorId.bloodGroup} size="sm" /> : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{new Date(apt.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{apt.timeSlot}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{apt.branchId?.name || apt.location || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={apt.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {apt.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'Approved')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                              Approve
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Rejected')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.4rem', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                              Reject
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'Approved' && (
                          <>
                            <button onClick={() => handleStatusChange(apt._id, 'Ongoing')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '0.4rem', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; }}>
                              Ongoing
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Missed')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.4rem', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                              Missed
                            </button>
                          </>
                        )}
                        {apt.status === 'Ongoing' && (
                          <>
                            <button onClick={() => handleCompleteClick(apt)} style={{ padding: '0.25rem 0.625rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; }}>
                              Complete
                            </button>
                            <button onClick={() => handleStatusChange(apt._id, 'Cancelled')} style={{ padding: '0.25rem 0.625rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; }}>
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!appointments?.length && (
                  <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No appointments found.</td></tr>
                )}
              </tbody>
            </table>
        )}
      </div>

      {/* Donor Verification / Completion Modal */}
      {verifyAptId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '92dvh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
              🛡️ Verify Donor Details
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Confirm and update the donor's medical eligibility details before completing this donation.
            </p>
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Donor Name</label>
                <input type="text" disabled value={verifyAptId.donorId?.fullName || verifyAptId.userId?.name || ''}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem', boxSizing: 'border-box', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gender *</label>
                  <select required value={verifyForm.gender} onChange={e => setVerifyForm({ ...verifyForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <option value="">Select Gender</option>
                    {['male', 'female', 'other'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blood Group *</label>
                  <select required value={verifyForm.bloodGroup} onChange={e => setVerifyForm({ ...verifyForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date of Birth *</label>
                  <input type="date" required value={verifyForm.dateOfBirth} onChange={e => setVerifyForm({ ...verifyForm, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weight (kg) *</label>
                  <input type="number" min="45" required value={verifyForm.weight} onChange={e => setVerifyForm({ ...verifyForm, weight: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Govt ID Type *</label>
                  <select value={verifyForm.idType} onChange={e => setVerifyForm({ ...verifyForm, idType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID'].map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID Number *</label>
                  <input type="text" required value={verifyForm.idNumber} onChange={e => setVerifyForm({ ...verifyForm, idNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>📞 Emergency Contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Name *</label>
                    <input type="text" required value={verifyForm.emergencyName} onChange={e => setVerifyForm({ ...verifyForm, emergencyName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Relation *</label>
                    <input type="text" required value={verifyForm.emergencyRelation} onChange={e => setVerifyForm({ ...verifyForm, emergencyRelation: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Phone *</label>
                  <PhoneInput
                    country={'in'}
                    value={verifyForm.emergencyPhone}
                    onChange={phone => setVerifyForm({ ...verifyForm, emergencyPhone: phone })}
                    inputStyle={{
                      width: '100%',
                      height: '38px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      paddingLeft: '48px'
                    }}
                    buttonStyle={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--glass-border)',
                      borderTopLeftRadius: '8px',
                      borderBottomLeftRadius: '8px',
                    }}
                    dropdownStyle={{
                      background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setVerifyAptId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: 'var(--btn-radius)', background: 'var(--gradient-primary)', boxShadow: '0 0 20px var(--accent-glow)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  Verify & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
