import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCamps, fetchCampRegistrations, updateRegistrationStatus } from '../redux/slices/campSlice';
import usePolling from '../hooks/usePolling';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiCheck, 
  FiRefreshCw, 
  FiSearch, 
  FiUserCheck, 
  FiDroplet,
  FiFileText,
  FiAward
} from 'react-icons/fi';

export default function StaffCamps() {
  const dispatch = useDispatch();
  const { camps, registrations, loading } = useSelector((s) => s.camps);
  const { user } = useSelector((s) => s.auth);

  const [selectedCamp, setSelectedCamp] = useState(null);
  const [campFilter, setCampFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  const loadCampsList = () => {
    const params = new URLSearchParams();
    if (user && user.branchId) {
      params.append('branchId', user.branchId);
    }
    dispatch(fetchCamps(params.toString()));
  };

  const loadRegistrations = async (campId, silent = false) => {
    if (!silent) setLoadingRegistrants(true);
    try {
      await dispatch(fetchCampRegistrations(campId)).unwrap();
    } catch (err) {
      if (!silent) toast.error(err || 'Failed to fetch camp registrations');
    } finally {
      if (!silent) setLoadingRegistrants(false);
    }
  };

  usePolling(() => {
    loadCampsList();
    if (selectedCamp) {
      loadRegistrations(selectedCamp._id, true);
    }
  }, 10000, [user, selectedCamp?._id]);

  const handleSelectCamp = (camp) => {
    setSelectedCamp(camp);
    loadRegistrations(camp._id, false);
  };

  const handleStatusChange = async (regId, status, donorName) => {
    try {
      const res = await dispatch(updateRegistrationStatus({ id: regId, status })).unwrap();
      if (res.success) {
        toast.success(`Updated ${donorName}'s status to ${status}!`);
        if (selectedCamp) {
          loadRegistrations(selectedCamp._id);
          // Reload camps list to keep registration/donation counters fresh
          loadCampsList();
        }
      }
    } catch (err) {
      toast.error(err || 'Failed to update status');
    }
  };

  // Filter camps by status tab
  const filteredCamps = camps.filter((camp) => {
    if (campFilter === 'all') return true;
    return camp.status === campFilter;
  });

  // Filter registrants by search query and status filter
  const filteredRegistrations = registrations.filter((reg) => {
    if (regStatusFilter !== 'all' && reg.status !== regStatusFilter) return false;

    const donorName = reg.donorId?.fullName || '';
    const donorPhone = reg.donorId?.phone || '';
    const bloodGroup = reg.donorId?.bloodGroup || '';
    const query = searchQuery.toLowerCase();

    return (
      donorName.toLowerCase().includes(query) ||
      donorPhone.includes(query) ||
      bloodGroup.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', label: 'ACTIVE' };
      case 'upcoming': return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'UPCOMING' };
      case 'completed': return { bg: 'rgba(16,185,129,0.15)', text: '#10b981', label: 'COMPLETED' };
      case 'cancelled': return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'CANCELLED' };
      default: return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', label: status?.toUpperCase() };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            🎪 Donation Camps Checklist
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Check in registered blood donors, record attendance, and log completed donations.
          </p>
        </div>
        <button
          onClick={() => {
            loadCampsList();
            if (selectedCamp) loadRegistrations(selectedCamp._id);
          }}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="camps-grid" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Column: Camp List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {['all', 'active', 'upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCampFilter(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  background: campFilter === tab ? 'var(--accent)' : 'var(--bg-surface)',
                  color: campFilter === tab ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching camps..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {filteredCamps.map((camp) => {
                const isSelected = selectedCamp?._id === camp._id;
                const statusInfo = getStatusColor(camp.status);
                return (
                  <div
                    key={camp._id}
                    className="card"
                    onClick={() => handleSelectCamp(camp)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {camp.name}
                      </h3>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        background: statusInfo.bg,
                        color: statusInfo.text,
                        whiteSpace: 'nowrap'
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCalendar style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span>{new Date(camp.date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span>{camp.startTime} - {camp.endTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {camp.address?.street}, {camp.address?.city}
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      marginTop: '0.25rem', 
                      paddingTop: '0.5rem', 
                      borderTop: '1px solid var(--border)', 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr', 
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <div>
                        <div>Registered</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: 2 }}>
                          {camp.totalRegistrations}
                        </div>
                      </div>
                      <div>
                        <div>Attended</div>
                        <div style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.85rem', marginTop: 2 }}>
                          {camp.totalAttendees || 0}
                        </div>
                      </div>
                      <div>
                        <div>Donated</div>
                        <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem', marginTop: 2 }}>
                          {camp.totalDonations || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCamps.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No camps found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Registrants checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedCamp ? (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Selected Camp Header details */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                    CAMP REGISTRATION WORKSPACE
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Max Capacity: <strong>{selectedCamp.maxDonors}</strong>
                  </span>
                </div>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedCamp.name}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  📍 {selectedCamp.address?.street}, {selectedCamp.address?.city}, {selectedCamp.address?.state}
                </p>
              </div>

              {/* Registrants Search */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search registrants by name, phone, or blood group..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>
                <button
                  onClick={() => loadRegistrations(selectedCamp._id)}
                  className="btn-ghost"
                  style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Reload registrants list"
                >
                  <FiRefreshCw />
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['all', 'Pending Approval', 'Approved', 'Rejected', 'Attended', 'Missed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setRegStatusFilter(status)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: regStatusFilter === status ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: regStatusFilter === status ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Registrants Table/List */}
              {loadingRegistrants ? (
                <LoadingSpinner text="Retrieving camp registrations..." />
              ) : (
                <div className="table-wrapper" style={{ maxHeight: '55dvh', overflowY: 'auto', borderRadius: '0.75rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Donor</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', width: '60px' }}>Blood</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Pass ID / Phone</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>Status</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>Check-in Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => {
                        const donor = reg.donorId;
                        return (
                          <tr
                            key={reg._id}
                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                          >
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{donor?.fullName || 'Registered Guest'}</div>
                              <div style={{ fontSize: '0.68rem', color: donor?.isEligible ? '#10b981' : '#f59e0b' }}>
                                {donor?.isEligible ? 'Eligible' : 'Cooldown / Check Card'}
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <BloodGroupBadge group={donor?.bloodGroup} size="sm" />
                            </td>
                            <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reg.registrationId}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{donor?.phone || 'No phone'}</div>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <StatusBadge status={reg.status} />
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                {reg.status === 'Pending Approval' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(reg._id, 'Approved', donor?.fullName)}
                                      className="btn-primary"
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      <FiCheck /> Approve
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(reg._id, 'Rejected', donor?.fullName)}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: 'rgba(239,68,68,0.15)',
                                        color: '#ef4444',
                                        border: '1px solid #ef4444',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                
                                {reg.status === 'Approved' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(reg._id, 'Attended', donor?.fullName)}
                                      className="btn-primary"
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        background: '#10b981',
                                        color: 'white'
                                      }}
                                    >
                                      <FiUserCheck /> Check In
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(reg._id, 'Missed', donor?.fullName)}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: 'rgba(107,114,128,0.15)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      Missed
                                    </button>
                                  </>
                                )}

                                {reg.status === 'Attended' && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#10b981',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px'
                                  }}>
                                    <FiAward /> Success
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No registrants match search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '4rem 2rem',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border)',
              borderRadius: '1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <FiDroplet style={{ fontSize: '2.5rem', color: 'var(--accent)', opacity: 0.8 }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>Checklist Closed</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Select a scheduled camp from the left pane to manage registrant attendance & log donations.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
