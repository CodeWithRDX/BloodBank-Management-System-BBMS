import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransfers, initiateTransfer, acceptTransfer, rejectTransfer } from '../redux/slices/transferSlice';
import { fetchBranches } from '../redux/slices/branchSlice';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { FiPlus, FiArrowRight, FiCheckCircle, FiXCircle, FiRefreshCw, FiAlertCircle, FiInfo, FiTruck } from 'react-icons/fi';

import usePolling from '../hooks/usePolling';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  { value: 'whole_blood', label: 'Whole Blood' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'platelets', label: 'Platelets' },
  { value: 'red_cells', label: 'Red Blood Cells' },
];

export default function AdminTransfers() {
  const dispatch = useDispatch();
  const { transfers, loading } = useSelector((s) => s.transfers);
  const { branches } = useSelector((s) => s.branches);
  const { user } = useSelector((s) => s.auth);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isInitiateOpen, setIsInitiateOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromBranch: '',
    toBranch: '',
    bloodGroup: '',
    component: 'whole_blood',
    quantity: 1,
    reason: '',
  });

  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    dispatch(fetchBranches({}));
  }, [dispatch]);

  const loadTransfers = () => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    dispatch(fetchTransfers(params));
  };

  usePolling(loadTransfers, 10000, [statusFilter]);

  // Autofill fromBranch for branch admins / staff
  useEffect(() => {
    if (user && user.role !== 'admin' && user.branchId) {
      setTransferForm((prev) => ({ ...prev, fromBranch: user.branchId }));
    }
  }, [user]);

  const handleInitiateSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.fromBranch || !transferForm.toBranch) {
      toast.error('Source and Destination branches are required');
      return;
    }
    if (transferForm.fromBranch === transferForm.toBranch) {
      toast.error('Source and Destination branches cannot be the same');
      return;
    }
    if (transferForm.quantity <= 0) {
      toast.error('Quantity must be at least 1 unit');
      return;
    }

    try {
      await dispatch(initiateTransfer(transferForm)).unwrap();
      toast.success('🔄 Blood transfer request initiated successfully!');
      setIsInitiateOpen(false);
      setTransferForm({
        fromBranch: user?.role !== 'admin' && user?.branchId ? user.branchId : '',
        toBranch: '',
        bloodGroup: '',
        component: 'whole_blood',
        quantity: 1,
        reason: '',
      });
      loadTransfers();
    } catch (err) {
      toast.error(err || 'Failed to initiate transfer');
    }
  };

  const handleAccept = async (id, transferId) => {
    if (!window.confirm(`Are you sure you want to approve transfer ${transferId}? This will automatically adjust inventories of both branches.`)) {
      return;
    }
    try {
      await dispatch(acceptTransfer(id)).unwrap();
      toast.success('Transfer approved and completed!');
      loadTransfers();
    } catch (err) {
      toast.error(err || 'Failed to approve transfer');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    try {
      await dispatch(rejectTransfer({ id: rejectId, reason: rejectReason })).unwrap();
      toast.success('Transfer request rejected');
      setRejectId(null);
      setRejectReason('');
      loadTransfers();
    } catch (err) {
      toast.error(err || 'Failed to reject transfer');
    }
  };

  // Helper to check if current user can approve/reject the transfer
  // Destination branch admins / super admin can approve/reject
  const canApprove = (transfer) => {
    if (!user) return false;
    if (transfer.status !== 'pending') return false;
    if (user.role === 'admin') return true;
    if (user.role === 'branch_admin' && transfer.toBranch?._id === user.branchId) return true;
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            🔄 Branch Transfers
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Manage and track blood inventory movements and request approvals between branches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(user?.role === 'admin' || user?.role === 'branch_admin') && (
            <button
              onClick={() => setIsInitiateOpen(true)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              <FiPlus /> Initiate Transfer
            </button>
          )}
          <button
            onClick={loadTransfers}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="btn-ghost"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: statusFilter === status ? 'var(--accent)' : 'var(--bg-surface)',
              color: statusFilter === status ? '#fff' : 'var(--text-secondary)',
              borderColor: statusFilter === status ? 'var(--accent)' : 'var(--border)',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content Table / Card List */}
      {loading ? (
        <LoadingSpinner text="Loading transfers..." />
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Route</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Blood Group</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Reason</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Details</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr
                    key={t._id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {t.transferId}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 500 }}>
                        <span>{t.fromBranch?.name}</span>
                        <FiArrowRight style={{ color: 'var(--accent)' }} />
                        <span>{t.toBranch?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem' }}>
                        {t.bloodGroup}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 6, textTransform: 'capitalize' }}>
                        {t.component?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {t.quantity} unit{t.quantity > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.reason || 'No reason provided'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      <div>Req By: {t.requestedBy?.name || 'Admin'}</div>
                      {t.approvedBy && <div>Appr By: {t.approvedBy?.name}</div>}
                      {t.status === 'rejected' && t.rejectionReason && (
                        <div style={{ color: '#ef4444', marginTop: 2 }}>Reason: {t.rejectionReason}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {canApprove(t) ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleAccept(t._id, t.transferId)}
                            className="btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                          >
                            <FiCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => setRejectId(t._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 10px',
                              background: 'rgba(239,68,68,0.15)',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          {t.status !== 'pending' ? 'Completed' : 'No Action Available'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <FiInfo style={{ fontSize: '1.5rem', marginBottom: '0.5rem', verticalAlign: 'middle' }} /> No transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INITIATE TRANSFER MODAL */}
      <Modal isOpen={isInitiateOpen} onClose={() => setIsInitiateOpen(false)} title="🔄 Initiate Blood Transfer Request" size="md">
        <form onSubmit={handleInitiateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Source Branch *</label>
            <select
              required
              disabled={user?.role !== 'admin' && !!user?.branchId}
              value={transferForm.fromBranch}
              onChange={(e) => setTransferForm({ ...transferForm, fromBranch: e.target.value })}
              className="input"
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
            >
              <option value="">Select Source Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            {user?.role !== 'admin' && user?.branchId && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Automatically locked to your assigned branch.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination Branch *</label>
            <select
              required
              value={transferForm.toBranch}
              onChange={(e) => setTransferForm({ ...transferForm, toBranch: e.target.value })}
              className="input"
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
            >
              <option value="">Select Destination Branch</option>
              {branches
                .filter((b) => b._id !== transferForm.fromBranch)
                .map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blood Group *</label>
              <select
                required
                value={transferForm.bloodGroup}
                onChange={(e) => setTransferForm({ ...transferForm, bloodGroup: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              >
                <option value="">Select Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Component *</label>
              <select
                required
                value={transferForm.component}
                onChange={(e) => setTransferForm({ ...transferForm, component: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              >
                {COMPONENTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity (Units) *</label>
            <input
              required
              type="number"
              min="1"
              value={transferForm.quantity}
              onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 0 })}
              className="input"
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Reason for Transfer</label>
            <textarea
              placeholder="e.g. Critical stock shortage at destination branch"
              value={transferForm.reason}
              onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
              className="input"
              rows={3}
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsInitiateOpen(false)}
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* REJECT COMMENT MODAL */}
      <Modal isOpen={!!rejectId} onClose={() => setRejectId(null)} title="❌ Reject Transfer Request" size="sm">
        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Please state the reason for rejecting this blood transfer request.
          </p>
          <textarea
            required
            placeholder="e.g. Insufficient inventory units available for this blood group"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="input"
            rows={3}
            style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => { setRejectId(null); setRejectReason(''); }}
              className="btn-ghost"
              style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem', border: 'none', cursor: 'pointer', background: '#ef4444' }}
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
