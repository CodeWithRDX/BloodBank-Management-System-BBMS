import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCamps, createCamp, cancelCamp, fetchCampRegistrations, updateRegistrationStatus } from '../redux/slices/campSlice';
import { fetchBranches } from '../redux/slices/branchSlice';
import usePolling from '../hooks/usePolling';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import MapPicker from '../components/MapPicker';
import { FiPlus, FiCalendar, FiClock, FiMapPin, FiUsers, FiRefreshCw, FiAlertTriangle, FiPhone, FiUser, FiInfo, FiCheck, FiUserCheck, FiAward } from 'react-icons/fi';

const handlePincodeLookup = async (pincode, updateFormCallback) => {
  if (!/^\d{6}$/.test(pincode)) return;
  
  const toastId = toast.loading('Looking up pincode...');
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const office = data[0].PostOffice[0];
      updateFormCallback({
        city: office.District || office.Division || office.Circle,
        state: office.State
      });
      toast.success('Pincode details fetched!', { id: toastId });
      return;
    }
    
    // Fallback: Zippopotam
    const resFallback = await fetch(`https://api.zippopotam.us/IN/${pincode}`);
    if (resFallback.ok) {
      const dataFallback = await resFallback.json();
      if (dataFallback.places && dataFallback.places.length > 0) {
        const place = dataFallback.places[0];
        updateFormCallback({
          city: place['place name'] || '',
          state: place['state'] || ''
        });
        toast.success('Pincode details fetched!', { id: toastId });
        return;
      }
    }
    toast.error('Pincode not found.', { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error('Failed to lookup pincode.', { id: toastId });
  }
};


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
    address: { street: '', city: '', state: '', country: 'India', pincode: '' },
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
  }, [dispatch]);

  const loadCamps = () => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (branchFilter !== 'all') params.branchId = branchFilter;
    dispatch(fetchCamps(params));
  };

  usePolling(() => {
    loadCamps();
    if (selectedCamp) {
      handleViewRegistrations(selectedCamp, true);
    }
  }, 10000, [statusFilter, branchFilter, selectedCamp?._id]);

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

    const lat = parseFloat(newCamp.latitude);
    const lng = parseFloat(newCamp.longitude);
    if (isNaN(lat) || lat === 0 || isNaN(lng) || lng === 0) {
      toast.error('Please select a valid location on the map');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Latitude must be between -90 and 90, and longitude between -180 and 180');
      return;
    }

    const pin = newCamp.address.pincode;
    if (!/^\d{6}$/.test(pin)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      const payload = {
        ...newCamp,
        latitude: lat,
        longitude: lng,
      };
      await dispatch(createCamp(payload)).unwrap();
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
        address: { street: '', city: '', state: '', country: 'India', pincode: '' },
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

  const handleViewRegistrations = async (camp, silent = false) => {
    setSelectedCamp(camp);
    if (!silent) setRegLoading(true);
    try {
      const res = await dispatch(fetchCampRegistrations(camp._id)).unwrap();
      setRegistrations(res.data || []);
    } catch (err) {
      if (!silent) toast.error('Failed to load registrations');
    } finally {
      if (!silent) setRegLoading(false);
    }
  };

  const handleStatusChange = async (regId, status, donorName) => {
    try {
      const res = await dispatch(updateRegistrationStatus({ id: regId, status })).unwrap();
      if (res.success) {
        toast.success(`Updated ${donorName}'s status to ${status}!`);
        if (selectedCamp) {
          const regRes = await dispatch(fetchCampRegistrations(selectedCamp._id)).unwrap();
          setRegistrations(regRes.data || []);
          loadCamps();
        }
      }
    } catch (err) {
      toast.error(err || 'Failed to update status');
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
          <div className="form-grid-2">
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

          <div className="form-grid-2">
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

          <div className="form-grid-3">
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
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>📍 Address & Location</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pincode (6-Digit) *</label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 110001"
                  value={newCamp.address.pincode || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setNewCamp(prev => ({
                      ...prev,
                      address: { ...prev.address, pincode: val }
                    }));
                    if (val.length === 6) {
                      handlePincodeLookup(val, (info) => {
                        setNewCamp(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            city: info.city,
                            state: info.state
                          }
                        }));
                      });
                    }
                  }}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Street / Landmark *</label>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>City *</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>State *</label>
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

            {/* Map Picker Component */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Select Coordinates on Map *
              </label>
              <MapPicker
                latitude={newCamp.latitude}
                longitude={newCamp.longitude}
                onChange={(loc) => {
                  setNewCamp(prev => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    address: {
                      ...prev.address,
                      street: loc.street || prev.address.street,
                      city: loc.city || prev.address.city,
                      state: loc.state || prev.address.state,
                      pincode: loc.pincode || prev.address.pincode
                    }
                  }));
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Latitude</label>
                <input
                  readOnly
                  disabled
                  type="number"
                  placeholder="Latitude"
                  value={newCamp.latitude}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Longitude</label>
                <input
                  readOnly
                  disabled
                  type="number"
                  placeholder="Longitude"
                  value={newCamp.longitude}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>


          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }} className="form-grid-2">
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
            <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Donor</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Blood Group</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Phone</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Eligibility</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => {
                    const donor = reg.donorId;
                    return (
                      <tr key={reg._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {donor?.fullName || reg.userId?.name || 'Unknown Donor'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem' }}>
                            {donor?.bloodGroup || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          {donor?.phone || '—'}
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
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <StatusBadge status={reg.status} />
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            {reg.status === 'Pending Approval' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(reg._id, 'Approved', donor?.fullName || reg.userId?.name)}
                                  className="btn-primary"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
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
                                  onClick={() => handleStatusChange(reg._id, 'Rejected', donor?.fullName || reg.userId?.name)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
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
                                  onClick={() => handleStatusChange(reg._id, 'Attended', donor?.fullName || reg.userId?.name)}
                                  className="btn-primary"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
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
                                  onClick={() => handleStatusChange(reg._id, 'Missed', donor?.fullName || reg.userId?.name)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
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
                                fontSize: '0.7rem',
                                color: '#10b981',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 8px'
                              }}>
                                <FiAward /> Attended
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
