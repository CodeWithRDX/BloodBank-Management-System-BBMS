import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, addInventoryItem, updateInventoryItem, fetchInventorySummary } from '../redux/slices/inventorySlice';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import { FiPlus, FiEdit3, FiRefreshCw, FiAlertTriangle, FiSearch, FiInfo, FiTrash2 } from 'react-icons/fi';

import usePolling from '../hooks/usePolling';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  { value: 'whole_blood', label: 'Whole Blood' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'platelets', label: 'Platelets' },
  { value: 'red_cells', label: 'Red Blood Cells' },
];
const STATUSES = ['available', 'reserved', 'issued', 'expired', 'discarded', 'transferred'];

export default function StaffInventory() {
  const dispatch = useDispatch();
  const { items, summary, total, loading } = useSelector((s) => s.inventory);
  const { user } = useSelector((s) => s.auth);

  const [bgFilter, setBgFilter] = useState('');
  const [compFilter, setCompFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('available'); // default to available

  // Modal controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    bloodGroup: '',
    component: 'whole_blood',
    quantity: 1,
    expiryDate: '',
    storageLocation: 'Main Fridge A',
    reason: '',
  });

  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 0,
    status: 'available',
    storageLocation: '',
  });

  const loadInventory = () => {
    const params = new URLSearchParams();
    if (bgFilter) params.append('bloodGroup', bgFilter);
    if (compFilter) params.append('component', compFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (user && user.branchId) params.append('branchId', user.branchId);

    dispatch(fetchInventory(params.toString()));
    dispatch(fetchInventorySummary());
  };

  usePolling(loadInventory, 10000, [bgFilter, compFilter, statusFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.bloodGroup) {
      toast.error('Please select blood group');
      return;
    }
    if (addForm.quantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    try {
      const data = { ...addForm };
      if (!data.expiryDate) delete data.expiryDate; // let server generate it
      await dispatch(addInventoryItem(data)).unwrap();
      toast.success('🎉 Inventory unit added successfully!');
      setIsAddOpen(false);
      setAddForm({
        bloodGroup: '',
        component: 'whole_blood',
        quantity: 1,
        expiryDate: '',
        storageLocation: 'Main Fridge A',
        reason: '',
      });
      loadInventory();
    } catch (err) {
      toast.error(err || 'Failed to add item');
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditForm({
      quantity: item.quantity,
      status: item.status,
      storageLocation: item.storageLocation || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.quantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    try {
      await dispatch(updateInventoryItem({ id: editItem._id, itemData: editForm })).unwrap();
      toast.success('Inventory unit updated successfully');
      setEditItem(null);
      loadInventory();
    } catch (err) {
      toast.error(err || 'Failed to update item');
    }
  };

  const handleDiscard = async (item) => {
    if (!window.confirm(`Discard unit ${item.unitNumber} (${item.bloodGroup} ${item.component})? This will mark it discarded.`)) {
      return;
    }
    try {
      await dispatch(updateInventoryItem({ id: item._id, itemData: { status: 'discarded' } })).unwrap();
      toast.success('Unit marked as discarded');
      loadInventory();
    } catch (err) {
      toast.error(err || 'Failed to discard unit');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            📦 Branch Inventory Control
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Monitor, record, adjust, and audit blood units stocked at your assigned branch
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FiPlus /> Add Blood Unit
          </button>
          <button
            onClick={loadInventory}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="responsive-grid-8">
        {BLOOD_GROUPS.map((g) => {
          const sum = summary.find(s => s.bloodGroup === g);
          return (
            <div key={g} className="card" style={{ padding: '0.75rem', textAlign: 'center', minWidth: '70px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{g}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
                {sum ? sum.totalUnits : 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BLOOD GROUP</label>
          <select
            value={bgFilter}
            onChange={(e) => setBgFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
          >
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>COMPONENT</label>
          <select
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
          >
            <option value="">All Components</option>
            {COMPONENTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STATUS</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner text="Querying stock registries..." />
      ) : (
        <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Unit Number</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Blood Group</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Component</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Stock Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Storage Location</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Collected Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Expiry Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {item.unitNumber}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <BloodGroupBadge group={item.bloodGroup} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {item.component?.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {item.quantity} unit{item.quantity !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {item.storageLocation || 'Main Storage'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(item.collectedDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <span style={{
                        color: new Date(item.expiryDate) < new Date() ? '#ef4444' : 'var(--text-secondary)',
                        fontWeight: new Date(item.expiryDate) < new Date() ? 'bold' : 'normal'
                      }}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: item.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: item.status === 'available' ? '#10b981' : '#ef4444'
                      }}>
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="btn-ghost"
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <FiEdit3 /> Edit
                        </button>
                        {item.status === 'available' && (
                          <button
                            onClick={() => handleDiscard(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: 'rgba(239,68,68,0.15)',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <FiTrash2 /> Discard
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No inventory records found matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      )}

      {/* ADD BLOOD UNIT MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="📦 Record / Add Inventory Blood Unit" size="md">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blood Group *</label>
              <select
                required
                value={addForm.bloodGroup}
                onChange={(e) => setAddForm({ ...addForm, bloodGroup: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              >
                <option value="">Select Group</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Component *</label>
              <select
                required
                value={addForm.component}
                onChange={(e) => setAddForm({ ...addForm, component: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              >
                {COMPONENTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity (Units) *</label>
              <input
                required
                type="number"
                min="1"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 0 })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expiry Date (Optional)</label>
              <input
                type="date"
                value={addForm.expiryDate}
                onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Storage Location / Freezer Rack</label>
            <input
              type="text"
              placeholder="e.g. Rack B, Shelf 3"
              value={addForm.storageLocation}
              onChange={(e) => setAddForm({ ...addForm, storageLocation: e.target.value })}
              className="input"
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Reason / Notes</label>
            <textarea
              placeholder="e.g. Received from community blood campaign #3"
              value={addForm.reason}
              onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
              className="input"
              rows={3}
              style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
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
              Add Stock Unit
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT/ADJUST MODAL */}
      {editItem && (
        <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={`✏️ Adjust Unit — ${editItem.unitNumber}`} size="sm">
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity (Units)</label>
              <input
                required
                type="number"
                min="0"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Storage Location</label>
              <input
                type="text"
                value={editForm.storageLocation}
                onChange={(e) => setEditForm({ ...editForm, storageLocation: e.target.value })}
                className="input"
                style={{ padding: '0.6rem 0.875rem', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditItem(null)}
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
                Save Adjustments
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
