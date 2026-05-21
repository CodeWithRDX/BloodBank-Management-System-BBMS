import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCamps, createCamp, cancelCamp, fetchCampRegistrations } from '../redux/slices/campSlice';
import { fetchBranches } from '../redux/slices/branchSlice';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { FiPlus, FiCalendar, FiClock, FiMapPin, FiUsers, FiRefreshCw, FiAlertTriangle, FiPhone, FiUser, FiInfo } from 'react-icons/fi';

export default function AdminCamps() {
  const dispatch = useDispatch();
  const { camps, loading } = useSelector((s) => s.camps);
  const { branches } = useSelector((s) => s.branches);

  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Creation modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCamp, setNewCamp] = useState({
    name: '',
    organizer: '',
    branchId: '',
    date: '',
    startTime: '',
    endTime: '',
    address: { street: '', city: '', state: '', country: 'India' },
    maxDonors: 50,
    description: '',
    latitude: 0,
    longitude: 0,
    contactPerson: { name: '', phone: '' }
  });

  // Registrations modal state
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBranches({}));
    loadCamps();
  }, [dispatch, statusFilter, branchFilter]);

  const loadCamps = () => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (branchFilter !== 'all') params.branchId = branchFilter;
    dispatch(fetchCamps(params));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newCamp.branchId) {
      toast.error('Please select an associated branch');
      return;
    }
    // Validation
    const selectedDate = new Date(newCamp.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Camp date cannot be in the past');
      return;
    }
    if (newCamp.maxDonors <= 0) {
      toast.error('Capacity must be greater than zero');
      return;
    }

    try {
      await dispatch(createCamp(newCamp)).unwrap();
      toast.success('🎉 Donation camp scheduled successfully!');
      setIsCreateOpen(false);
      loadCamps();
      setNewCamp({
        name: '',
        organizer: '',
        branchId: '',
        date: '',
        startTime: '',
        endTime: '',
        address: { street: '', city: '', state: '', country: 'India' },
        maxDonors: 50,
        description: '',
        latitude: 0,
        longitude: 0,
        contactPerson: { name: '', phone: '' }
      });
    } catch (err) {
      toast.error(err || 'Failed to create camp');
    }
  };

  const handleCancelCamp = async (id, name) => {
    if (!window.confirm(`Are you sure you want to cancel the camp "${name}"? Registered donors will be notified.`)) {
      return;
    }
    try {
      await dispatch(cancelCamp(id)).unwrap();
      toast.success('Camp cancelled successfully');
      loadCamps();
    } catch (err) {
      toast.error(err || 'Failed to cancel camp');
    }
  };

  const handleViewRegistrations = async (camp) => {
    setSelectedCamp(camp);
    setRegLoading(true);
    try {
      const res = await dispatch(fetchCampRegistrations(camp._id)).unwrap();
      setRegistrations(res.data || []);
    } catch (err) {
      toast.error('Failed to load registrations');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            🩸 Donation Camps
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Schedule and manage donor engagement donation camps
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FiPlus /> Schedule Camp
          </button>
          <button
            onClick={loadCamps}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STATUS</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BRANCH</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <LoadingSpinner text="Loading camps..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {camps.map((camp) => (
            <div
              key={camp._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.25rem',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {camp.name}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {camp.campId}
                  </span>
                </div>
                <StatusBadge status={camp.status} />
              </div>

              {/* Info Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCalendar style={{ color: 'var(--accent)' }} />
                  {new Date(camp.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiClock style={{ color: 'var(--accent)' }} />
                  {camp.startTime} - {camp.endTime}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMapPin style={{ color: 'var(--accent)' }} />
                  {camp.address?.street}, {camp.address?.city}, {camp.address?.state}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiUsers style={{ color: 'var(--accent)' }} />
                  Capacity: {camp.totalRegistrations} / {camp.maxDonors} Registered
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
                  <FiInfo style={{ color: 'var(--accent)' }} />
                  Branch: {camp.branchId?.name || 'Assigned'}
                </div>
              </div>

              {/* Stats pill */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                <div style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                  Donations: {camp.totalDonations}
                </div>
                <div style={{ padding: '4px 8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                  Attendees: {camp.totalAttendees}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleViewRegistrations(camp)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '7px 0', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Registrants
                </button>
                {camp.status === 'upcoming' && (
                  <button
                    onClick={() => handleCancelCamp(camp._id, camp.name)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

          {camps.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <FiAlertTriangle style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No donation camps scheduled matching current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="🗓️ Schedule Donation Camp" size="lg">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Camp Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Annual City Blood Drive"
                value={newCamp.name}
                onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Organizer Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Red Cross Society"
                value={newCamp.organizer}
                onChange={(e) => setNewCamp({ ...newCamp, organizer: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Associated Branch *</label>
              <select
                required
                value={newCamp.branchId}
                onChange={(e) => setNewCamp({ ...newCamp, branchId: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Max Capacity (Donors) *</label>
              <input
                required
                type="number"
                min="1"
                value={newCamp.maxDonors}
                onChange={(e) => setNewCamp({ ...newCamp, maxDonors: parseInt(e.target.value) || 0 })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date *</label>
              <input
                required
                type="date"
                value={newCamp.date}
                onChange={(e) => setNewCamp({ ...newCamp, date: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Time *</label>
              <input
                required
                type="time"
                value={newCamp.startTime}
                onChange={(e) => setNewCamp({ ...newCamp, startTime: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>End Time *</label>
              <input
                required
                type="time"
                value={newCamp.endTime}
                onChange={(e) => setNewCamp({ ...newCamp, endTime: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>📍 Address details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="Street / Landmark"
                  value={newCamp.address.street}
                  onChange={(e) => setNewCamp({ ...newCamp, address: { ...newCamp.address, street: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="City"
                  value={newCamp.address.city}
                  onChange={(e) => setNewCamp({ ...newCamp, address: { ...newCamp.address, city: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="State"
                  value={newCamp.address.state}
                  onChange={(e) => setNewCamp({ ...newCamp, address: { ...newCamp.address, state: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={newCamp.latitude}
                onChange={(e) => setNewCamp({ ...newCamp, latitude: parseFloat(e.target.value) || 0 })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={newCamp.longitude}
                onChange={(e) => setNewCamp({ ...newCamp, longitude: parseFloat(e.target.value) || 0 })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Person Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={newCamp.contactPerson.name}
                onChange={(e) => setNewCamp({ ...newCamp, contactPerson: { ...newCamp.contactPerson, name: e.target.value } })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={newCamp.contactPerson.phone}
                onChange={(e) => setNewCamp({ ...newCamp, contactPerson: { ...newCamp.contactPerson, phone: e.target.value } })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              placeholder="Provide camp details or instructions..."
              value={newCamp.description}
              onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
              className="input"
              rows={3}
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-ghost"
              style={{ flex: 1, padding: '10px 0', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: '10px 0', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
            >
              Create Camp
            </button>
          </div>
        </form>
      </Modal>

      {/* REGISTRATIONS MODAL */}
      <Modal isOpen={!!selectedCamp} onClose={() => setSelectedCamp(null)} title={`📋 Registrants — ${selectedCamp?.name}`} size="lg">
        {regLoading ? (
          <LoadingSpinner text="Loading registrants..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Donor</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Blood Group</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Phone</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Eligibility</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {reg.donorId?.fullName || reg.userId?.name || 'Unknown Donor'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem' }}>
                          {reg.donorId?.bloodGroup || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {reg.donorId?.phone || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          color: reg.isEligible ? '#10b981' : '#f59e0b',
                          fontWeight: 600,
                          fontSize: '0.78rem'
                        }}>
                          {reg.isEligible ? '✓ Eligible' : '⏳ Cooling Period'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: reg.status === 'donated' ? 'rgba(16,185,129,0.15)' : reg.status === 'attended' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                          color: reg.status === 'donated' ? '#10b981' : reg.status === 'attended' ? '#818cf8' : '#f59e0b'
                        }}>
                          {reg.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No donors registered for this camp yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setSelectedCamp(null)}
              className="btn-ghost"
              style={{ alignSelf: 'flex-end', padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
