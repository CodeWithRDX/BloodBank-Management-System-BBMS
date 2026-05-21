import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, addStaff, removeStaff, updateStaff } from '../redux/slices/staffSlice';
import { fetchBranches } from '../redux/slices/branchSlice';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiUser, FiSearch } from 'react-icons/fi';

const STAFF_ROLES = [
  { value: 'inventory_staff', label: 'Inventory Staff' },
  { value: 'camp_staff', label: 'Camp Staff' },
  { value: 'lab_staff', label: 'Lab Staff' },
  { value: 'reception_staff', label: 'Reception Staff' },
  { value: 'branch_manager', label: 'Branch Manager' },
];

const ROLE_COLORS = {
  inventory_staff: '#3b82f6',
  camp_staff: '#10b981',
  lab_staff: '#f59e0b',
  reception_staff: '#ec4899',
  branch_manager: '#8b5cf6',
};

const emptyForm = { name: '', email: '', password: '', phone: '', staffRole: 'inventory_staff', branchId: '' };

export default function AdminStaff() {
  const dispatch = useDispatch();
  const { staff, loading, total } = useSelector((s) => s.staff);
  const { branches } = useSelector((s) => s.branches);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchStaff({}));
    dispatch(fetchBranches({ status: 'approved' }));
  }, [dispatch]);

  const filtered = staff.filter((s) =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editMode) {
        await dispatch(updateStaff({ id: editId, ...form })).unwrap();
        toast.success('Staff updated');
      } else {
        await dispatch(addStaff(form)).unwrap();
        toast.success('Staff member added successfully');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditMode(false);
    } catch (err) {
      toast.error(err);
    } finally { setSubmitting(false); }
  };

  const handleEdit = (member) => {
    setForm({ name: member.fullName, email: member.email, phone: member.phone, staffRole: member.staffRole, branchId: member.branchId?._id || '', password: '' });
    setEditId(member._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleRemove = async (id, name) => {
    if (!confirm(`Remove staff member "${name}"? Their account will be deactivated.`)) return;
    try {
      await dispatch(removeStaff(id)).unwrap();
      toast.success('Staff member removed');
    } catch (err) { toast.error(err); }
  };

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            👥 Staff Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            {total} staff members across all branches
          </p>
        </div>
        <button onClick={() => { setShowModal(true); setEditMode(false); setForm(emptyForm); }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
          borderRadius: 10, background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
        }}>
          <FiPlus /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '100%' }}>
        <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="ios-safe-input"
          style={{ width: '100%', maxWidth: 400, padding: '10px 12px 10px 38px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ borderRadius: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Staff Member', 'Role', 'Branch', 'Employee ID', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</td></tr>
            ) : filtered.map((member) => (
              <tr key={member._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                      {member.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{member.fullName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                    background: `${ROLE_COLORS[member.staffRole]}20`,
                    color: ROLE_COLORS[member.staffRole],
                    border: `1px solid ${ROLE_COLORS[member.staffRole]}40`,
                  }}>
                    {STAFF_ROLES.find((r) => r.value === member.staffRole)?.label || member.staffRole}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {member.branchId?.name || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {member.staffId}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    background: member.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: member.isActive ? '#10b981' : '#ef4444',
                    border: `1px solid ${member.isActive ? '#10b981' : '#ef4444'}40`,
                  }}>
                    {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleEdit(member)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid #3b82f640', cursor: 'pointer' }}>
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleRemove(member._id, member.fullName)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef444440', cursor: 'pointer' }}>
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <FiUser size={32} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                No staff members found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(1rem, 3vw, 2rem)', width: '100%', maxWidth: 480, maxHeight: '92dvh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
              {editMode ? '✏️ Edit Staff Member' : '➕ Add Staff Member'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true },
                { label: 'Email', key: 'email', type: 'email', required: true },
                ...(!editMode ? [{ label: 'Password', key: 'password', type: 'password', required: true }] : []),
                { label: 'Phone', key: 'phone', type: 'tel', required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
                  <input type={type} required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Staff Role</label>
                <select value={form.staffRole} onChange={(e) => setForm({ ...form, staffRole: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assign Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  <option value="">Select Branch...</option>
                  {branches.filter((b) => b.status === 'approved').map((b) => (
                    <option key={b._id} value={b._id}>{b.name} — {b.address?.city}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  {submitting ? 'Saving...' : editMode ? 'Update' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
