import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDonors, deleteDonor } from '../redux/slices/donorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const TH = ({ c, right }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);

const AdminDonors = () => {
  const dispatch = useDispatch();
  const { donors, total, loading } = useSelector(s => s.donors);
  const [bgFilter, setBgFilter]     = useState('');
  const [keyword, setKeyword]       = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const p = new URLSearchParams();
    if (bgFilter) p.set('bloodGroup', bgFilter);
    if (keyword)  p.set('keyword', keyword);
    dispatch(fetchDonors(p.toString()));
  }, [dispatch, bgFilter, keyword]);

  const handleSearch = (e) => { e.preventDefault(); setKeyword(searchInput); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete donor "${name}"? This cannot be undone.`)) return;
    const res = await dispatch(deleteDonor(id));
    if (res.meta.requestStatus === 'fulfilled') toast.success('Donor deleted');
    else toast.error(res.payload || 'Failed to delete');
  };

  const calcAge = dob => dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600000)) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Donor Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {total} registered donors
          </p>
        </div>
      </div>

      {/* Search & filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.375rem' }}>
          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.85rem', height: '0.85rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Name, email, phone…" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ padding: '0.5rem 0.875rem 0.5rem 2.1rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', width: '14rem', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.875rem', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', borderRadius: '0.625rem' }}>Search</button>
          {keyword && (
            <button type="button" onClick={() => { setKeyword(''); setSearchInput(''); }} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </form>
        <select value={bgFilter} onChange={e => setBgFilter(e.target.value)} style={{ padding: '0.5rem 0.875rem', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer' }}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? <LoadingSpinner text="Loading donors…" /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--bg-elevated)' }}>
              <TH c="Donor" /><TH c="Group" /><TH c="Age" /><TH c="Phone" /><TH c="Donations" /><TH c="Eligible" /><TH c="Status" /><TH c="Action" right />
            </tr></thead>
            <tbody>
              {donors?.map(d => (
                <tr key={d._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '2.1rem', height: '2.1rem', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)',
                      }}>
                        {(d.fullName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{d.fullName}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={d.bloodGroup} size="sm" /></td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{calcAge(d.dateOfBirth)}</td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{d.phone || '—'}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', fontFamily: "'Space Grotesk', sans-serif" }}>{d.totalDonations}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginLeft: '0.2rem' }}>donations</span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                      background: d.isEligible ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                      border: `1px solid ${d.isEligible ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      color: d.isEligible ? '#4ade80' : '#fbbf24',
                    }}>
                      {d.isEligible ? '✓ Eligible' : '⏳ Waiting'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(d._id, d.fullName)} title="Delete donor"
                      style={{ padding: '0.3rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.5rem', cursor: 'pointer', color: '#f87171', display: 'flex', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                    >
                      <HiOutlineTrash style={{ width: '0.9rem', height: '0.9rem' }} />
                    </button>
                  </td>
                </tr>
              ))}
              {!donors?.length && (
                <tr><td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No donors found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDonors;
