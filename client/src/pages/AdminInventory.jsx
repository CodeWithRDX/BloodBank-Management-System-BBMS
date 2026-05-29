import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, addInventoryItem, updateInventoryItem } from '../redux/slices/inventorySlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';

import usePolling from '../hooks/usePolling';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS   = ['whole_blood', 'plasma', 'platelets', 'red_cells'];
const STATUSES     = ['available', 'reserved', 'issued', 'expired', 'discarded'];

const defaultForm = { bloodGroup: 'A+', component: 'whole_blood', quantity: 1, storageLocation: 'Main Storage', expiryDate: '', status: 'available' };

/* ── shared input/select style ─────────────── */
const selectStyle = { width: '100%', padding: '0.65rem 0.875rem', fontSize: '0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', cursor: 'pointer' };
const inputStyle  = { ...selectStyle, cursor: 'text' };
const Label = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
    {children}
  </label>
);
const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { items, total, loading } = useSelector(s => s.inventory);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const refresh = () => {
    const p = new URLSearchParams();
    if (filterGroup)  p.set('bloodGroup', filterGroup);
    if (filterStatus) p.set('status', filterStatus);
    dispatch(fetchInventory(p.toString()));
  };

  usePolling(refresh, 10000, [filterGroup, filterStatus]);

  const openAdd = () => {
    setEditItem(null);
    const d = new Date(); d.setDate(d.getDate() + 42);
    setForm({ ...defaultForm, expiryDate: d.toISOString().split('T')[0] });
    setModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ bloodGroup: item.bloodGroup, component: item.component, quantity: item.quantity, storageLocation: item.storageLocation, expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '', status: item.status });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = editItem
      ? await dispatch(updateInventoryItem({ id: editItem._id, itemData: form }))
      : await dispatch(addInventoryItem(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(editItem ? 'Item updated!' : 'Blood unit added!');
      setModal(false);
      refresh();
    } else toast.error(res.payload || 'Operation failed');
  };

  const isExpired = item => new Date(item.expiryDate) < new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Inventory Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {total} blood units in system
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--btn-radius)', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 0 16px var(--accent-glow)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
        >
          <HiOutlinePlus style={{ width: '1rem', height: '1rem' }} /> Add Blood Unit
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {[
          { value: filterGroup, onChange: e => setFilterGroup(e.target.value), options: [['', 'All Groups'], ...BLOOD_GROUPS.map(g => [g, g])] },
          { value: filterStatus, onChange: e => setFilterStatus(e.target.value), options: [['', 'All Statuses'], ...STATUSES.map(s => [s, s])] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={f.onChange} className="input" style={{ padding: '0.5rem 0.875rem', fontSize: '0.82rem', width: 'auto', cursor: 'pointer', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)' }}>
            {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        ))}
        {(filterGroup || filterStatus) && (
          <button onClick={() => { setFilterGroup(''); setFilterStatus(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.875rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.625rem', color: '#f87171', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <HiOutlineX style={{ width: '0.8rem', height: '0.8rem' }} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? <LoadingSpinner text="Loading inventory…" /> : (
          <table style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <TH c="Unit #" /><TH c="Group" /><TH c="Component" /><TH c="Qty" /><TH c="Expiry" /><TH c="Location" /><TH c="Status" /><TH c="Action" />
                </tr>
              </thead>
              <tbody>
                {items?.map(item => {
                  const expired = isExpired(item);
                  return (
                    <tr key={item._id} style={{
                      borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
                      background: expired && item.status === 'available' ? 'rgba(248,113,113,0.04)' : '',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = expired && item.status === 'available' ? 'rgba(248,113,113,0.04)' : ''; }}
                    >
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{item.unitNumber}</td>
                      <td style={{ padding: '0.875rem 1rem' }}><BloodGroupBadge group={item.bloodGroup} size="sm" /></td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{item.component?.replace('_', ' ')}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: expired ? '#f87171' : 'var(--text-secondary)', fontWeight: expired ? 600 : 400 }}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                        {expired && <span style={{ marginLeft: '0.3rem', fontSize: '0.68rem' }}>⚠ Expired</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.storageLocation}</td>
                      <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={item.status} /></td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => openEdit(item)} style={{ padding: '0.3rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          title="Edit"
                        >
                          <HiOutlinePencil style={{ width: '0.9rem', height: '0.9rem' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!items?.length && <tr><td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No inventory records found.</td></tr>}
              </tbody>
            </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} onClick={() => setModal(false)} />
          <div className="animate-scaleInCentered" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 50, width: '90%', maxWidth: '32rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', boxShadow: 'var(--card-shadow), 0 0 40px var(--accent-soft)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                {editItem ? '✏️ Edit Blood Unit' : '➕ Add Blood Unit'}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <HiOutlineX style={{ width: '0.9rem', height: '0.9rem' }} />
              </button>
            </div>
            {/* Modal body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid-2">
                <div><Label>Blood Group</Label><select name="bloodGroup" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} style={selectStyle} disabled={!!editItem}>{BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><Label>Component</Label><select name="component" value={form.component} onChange={e => setForm({ ...form, component: e.target.value })} style={selectStyle}>{COMPONENTS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select></div>
                <div><Label>Quantity</Label><input type="number" min="1" name="quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required style={inputStyle} /></div>
                <div><Label>Expiry Date</Label><input type="date" name="expiryDate" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required style={inputStyle} /></div>
                <div><Label>Storage Location</Label><input type="text" name="storageLocation" value={form.storageLocation} onChange={e => setForm({ ...form, storageLocation: e.target.value })} style={inputStyle} /></div>
                <div><Label>Status</Label><select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.625rem 1.5rem', border: 'none', fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving…' : editItem ? 'Update' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInventory;
