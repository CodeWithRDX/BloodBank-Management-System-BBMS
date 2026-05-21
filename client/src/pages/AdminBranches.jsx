import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches, approveBranch, rejectBranch, updateBranchStatus, registerBranch } from '../redux/slices/branchSlice';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiPauseCircle, FiMapPin, FiPhone, FiMail, FiFilter, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { MdPending, MdVerified, MdBlock } from 'react-icons/md';
import Modal from '../components/Modal';

import usePolling from '../hooks/usePolling';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(234,179,8,0.15)',   text: '#fbbf24', border: '#fbbf24' },
  approved:  { bg: 'rgba(16,185,129,0.15)',  text: '#10b981', border: '#10b981' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', border: '#ef4444' },
  suspended: { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8', border: '#818cf8' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`, letterSpacing: '0.03em',
    }}>
      {status?.toUpperCase()}
    </span>
  );
};

export default function AdminBranches() {
  const dispatch = useDispatch();
  const { branches, loading, total } = useSelector((s) => s.branches);
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    latitude: '',
    longitude: '',
    operatingHours: { open: '08:00', close: '20:00' },
    description: '',
  });

  const loadBranches = () => {
    dispatch(fetchBranches(filter !== 'all' ? { status: filter } : {}));
  };

  usePolling(loadBranches, 10000, [filter]);

  const handleApprove = async (id, name) => {
    try {
      await dispatch(approveBranch(id)).unwrap();
      toast.success(`✅ ${name} approved`);
    } catch (err) { toast.error(err); }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectBranch({ id: rejectModal._id, reason: rejectReason })).unwrap();
      toast.success('Branch rejected');
      setRejectModal(null); setRejectReason('');
    } catch (err) { toast.error(err); }
  };

  const handleSuspend = async (id, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
    try {
      await dispatch(updateBranchStatus({ id, status: newStatus })).unwrap();
      toast.success(`Branch ${newStatus}`);
    } catch (err) { toast.error(err); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.registrationNumber || !newBranch.email || !newBranch.phone || !newBranch.address.street || !newBranch.address.city || !newBranch.address.state) {
      return toast.error('Please fill in all required fields.');
    }
    try {
      const payload = {
        ...newBranch,
        latitude: parseFloat(newBranch.latitude) || 0,
        longitude: parseFloat(newBranch.longitude) || 0,
      };
      await dispatch(registerBranch(payload)).unwrap();
      toast.success('🎉 Branch registered successfully!');
      setIsAddModalOpen(false);
      setNewBranch({
        name: '',
        registrationNumber: '',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        latitude: '',
        longitude: '',
        operatingHours: { open: '08:00', close: '20:00' },
        description: '',
      });
      loadBranches();
    } catch (err) {
      toast.error(err || 'Failed to register branch');
    }
  };

  const tabs = [
    { key: 'all', label: 'All', icon: <FiFilter /> },
    { key: 'pending', label: 'Pending', icon: <MdPending /> },
    { key: 'approved', label: 'Approved', icon: <MdVerified /> },
    { key: 'rejected', label: 'Rejected', icon: <FiXCircle /> },
    { key: 'suspended', label: 'Suspended', icon: <MdBlock /> },
  ];

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            🏥 Branch Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            {total} branches registered on the platform
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <FiPlus /> Add Branch
          </button>
          <button
            onClick={() => dispatch(fetchBranches({}))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 20,
            background: filter === t.key ? 'var(--accent)' : 'var(--bg-elevated)',
            color: filter === t.key ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${filter === t.key ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Loading branches...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '1.25rem' }}>
          {branches.map((branch) => (
            <div key={branch._id} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '1.25rem',
              transition: 'box-shadow 0.2s',
            }}>
              {/* Branch Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {branch.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {branch.branchId || branch.registrationNumber}
                  </p>
                </div>
                <StatusBadge status={branch.status} />
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                  <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {branch.address?.street}, {branch.address?.city}, {branch.address?.state}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                  <FiPhone style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {branch.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                  <FiMail style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {branch.email}
                </div>
              </div>

              {/* Rejection Reason */}
              {branch.status === 'rejected' && branch.rejectionReason && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: '1rem', fontSize: '0.8rem', color: '#ef4444' }}>
                  Reason: {branch.rejectionReason}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {branch.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(branch._id, branch.name)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '7px 0', borderRadius: 8, background: 'rgba(16,185,129,0.15)',
                      color: '#10b981', border: '1px solid #10b981', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                    }}>
                      <FiCheckCircle /> Approve
                    </button>
                    <button onClick={() => setRejectModal(branch)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '7px 0', borderRadius: 8, background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                    }}>
                      <FiXCircle /> Reject
                    </button>
                  </>
                )}
                {branch.status === 'approved' && (
                  <button onClick={() => handleSuspend(branch._id, branch.status)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '7px 0', borderRadius: 8, background: 'rgba(99,102,241,0.15)',
                    color: '#818cf8', border: '1px solid #818cf8', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                  }}>
                    <FiPauseCircle /> Suspend
                  </button>
                )}
                {branch.status === 'suspended' && (
                  <button onClick={() => handleSuspend(branch._id, branch.status)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '7px 0', borderRadius: 8, background: 'rgba(16,185,129,0.15)',
                    color: '#10b981', border: '1px solid #10b981', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                  }}>
                    <FiCheckCircle /> Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}

          {branches.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏥</div>
              No branches found for this filter.
            </div>
          )}
        </div>
      )}

      {/* Add Branch Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="🏥 Add New Branch" size="lg">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Branch Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Metro Blood Centre"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registration Number *</label>
              <input
                required
                type="text"
                placeholder="e.g. REG-123456"
                value={newBranch.registrationNumber}
                onChange={(e) => setNewBranch({ ...newBranch, registrationNumber: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address *</label>
              <input
                required
                type="email"
                placeholder="e.g. contact@metroblood.com"
                value={newBranch.email}
                onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number *</label>
              <input
                required
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>📍 Address details</h4>
            <div className="form-grid-2-1-1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="Street Address *"
                  value={newBranch.address.street}
                  onChange={(e) => setNewBranch({ ...newBranch, address: { ...newBranch.address, street: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="City *"
                  value={newBranch.address.city}
                  onChange={(e) => setNewBranch({ ...newBranch, address: { ...newBranch.address, city: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  required
                  type="text"
                  placeholder="State *"
                  value={newBranch.address.state}
                  onChange={(e) => setNewBranch({ ...newBranch, address: { ...newBranch.address, state: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
            <div className="form-grid-3" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Zip Code</label>
                <input
                  type="text"
                  placeholder="e.g. 110001"
                  value={newBranch.address.zipCode}
                  onChange={(e) => setNewBranch({ ...newBranch, address: { ...newBranch.address, zipCode: e.target.value } })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 28.6139"
                  value={newBranch.latitude}
                  onChange={(e) => setNewBranch({ ...newBranch, latitude: e.target.value })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 77.2090"
                  value={newBranch.longitude}
                  onChange={(e) => setNewBranch({ ...newBranch, longitude: e.target.value })}
                  className="input"
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Opening Time</label>
              <input
                required
                type="time"
                value={newBranch.operatingHours.open}
                onChange={(e) => setNewBranch({ ...newBranch, operatingHours: { ...newBranch.operatingHours, open: e.target.value } })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Closing Time</label>
              <input
                required
                type="time"
                value={newBranch.operatingHours.close}
                onChange={(e) => setNewBranch({ ...newBranch, operatingHours: { ...newBranch.operatingHours, close: e.target.value } })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              placeholder="e.g. Main city branch with automated blood separators..."
              value={newBranch.description}
              onChange={(e) => setNewBranch({ ...newBranch, description: e.target.value })}
              className="input"
              rows={3}
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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
              Add Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(1rem, 3vw, 2rem)', width: '100%', maxWidth: 440, maxHeight: '92dvh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Reject Branch</h3>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Provide a reason for rejecting <strong>{rejectModal.name}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              rows={4}
              style={{ width: '100%', borderRadius: 8, padding: '10px 12px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleReject} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
