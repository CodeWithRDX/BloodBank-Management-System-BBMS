import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../redux/slices/adminSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin:    { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', text: '#a78bfa' },
  staff:    { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)',  text: '#60a5fa' },
  donor:    { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', text: '#f87171' },
  hospital: { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)',  text: '#34d399' },
};

const ROLE_EMOJIS = { admin: '🛡️', staff: '🧪', donor: '❤️', hospital: '🏥' };

const TH = ({ c, right }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, totalUsers } = useSelector(s => s.admin);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchUsers(roleFilter ? `role=${roleFilter}` : ''));
  }, [dispatch, roleFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will also remove their donor/hospital profile.`)) return;
    const res = await dispatch(deleteUser(id));
    if (res.meta.requestStatus === 'fulfilled') toast.success('User deleted');
    else toast.error(res.payload || 'Failed to delete');
  };

  const filtered = search
    ? users?.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {totalUsers} registered users
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.9rem', height: '0.9rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Search name / email…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.5rem 0.875rem 0.5rem 2.2rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', width: '15rem' }}
            />
          </div>
          {/* Role filter */}
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '0.5rem 0.875rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer' }}>
            <option value="">All Roles</option>
            {['admin', 'staff', 'donor', 'hospital'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            Showing {filtered?.length || 0} of {totalUsers} users
          </span>
        </div>
        {loading ? <LoadingSpinner text="Loading users…" /> : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><TH c="User" /><TH c="Email" /><TH c="Role" /><TH c="Phone" /><TH c="Status" /><TH c="Joined" /><TH c="Action" right /></tr></thead>
              <tbody>
                {filtered?.map(u => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.donor;
                  const initials = (u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                    >
                      {/* Name + avatar */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: rc.bg, border: `1px solid ${rc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: rc.text }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text, fontSize: '0.72rem', fontWeight: 700 }}>
                          {ROLE_EMOJIS[u.role]} {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u._id, u.name)} title="Delete user" style={{ padding: '0.3rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.5rem', cursor: 'pointer', color: '#f87171', display: 'flex', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                          >
                            <HiOutlineTrash style={{ width: '0.9rem', height: '0.9rem' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filtered?.length && <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
