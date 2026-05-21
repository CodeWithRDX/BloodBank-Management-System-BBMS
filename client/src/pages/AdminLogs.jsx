import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from '../redux/slices/branchSlice';
import API from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiFilter, FiRefreshCw, FiGrid, FiList, FiTrendingUp, FiUser, FiInfo, FiActivity } from 'react-icons/fi';

const INVENTORY_OPERATIONS = [
  { value: 'addition', label: 'Addition (Donation/Incoming)' },
  { value: 'subtraction', label: 'Subtraction (Transfusion/Expiry)' },
  { value: 'adjustment', label: 'Manual Adjustment' },
  { value: 'transfer', label: 'Branch Transfer' },
  { value: 'expiry', label: 'Expiry Disposal' },
  { value: 'wastage', label: 'Wastage Disposal' }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminLogs() {
  const dispatch = useDispatch();
  const { branches } = useSelector((s) => s.branches);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'audit'
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats / Summaries
  const [invStats, setInvStats] = useState(null);
  const [auditSummary, setAuditSummary] = useState(null);

  // Shared filters
  const [branchFilter, setBranchFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Inventory-specific filters
  const [opTypeFilter, setOpTypeFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  // Audit-specific filters
  const [actionTypeFilter, setActionTypeFilter] = useState('');

  useEffect(() => {
    dispatch(fetchBranches({}));
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
    loadLogs(1);
    loadSummaryStats();
  }, [activeTab, branchFilter, startDate, endDate, opTypeFilter, bloodGroupFilter, actionTypeFilter]);

  const loadLogs = async (pageNum = page) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 15 };
      if (branchFilter) params.branchId = branchFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (activeTab === 'inventory') {
        if (opTypeFilter) params.operationType = opTypeFilter;
        if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
        const res = await API.get('/logs/inventory', { params });
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        if (actionTypeFilter) params.actionType = actionTypeFilter;
        const res = await API.get('/logs/audit', { params });
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryStats = async () => {
    try {
      if (activeTab === 'inventory') {
        const res = await API.get('/logs/inventory/stats');
        setInvStats(res.data.data);
      } else {
        const res = await API.get('/logs/audit/summary');
        setAuditSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load summary stats', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadLogs(newPage);
    }
  };

  const clearFilters = () => {
    setBranchFilter('');
    setStartDate('');
    setEndDate('');
    setOpTypeFilter('');
    setBloodGroupFilter('');
    setActionTypeFilter('');
  };

  const getOpBadgeStyle = (op) => {
    switch (op) {
      case 'addition': return { bg: 'rgba(16,185,129,0.15)', text: '#10b981' };
      case 'subtraction': return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
      case 'expiry': return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
      case 'wastage': return { bg: 'rgba(120,113,108,0.15)', text: '#78716c' };
      case 'transfer': return { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' };
      default: return { bg: 'rgba(107,114,128,0.15)', text: '#6b7280' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
            📋 Activity & Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Trace database operations, security actions, and inventory changes across branches
          </p>
        </div>
        <button
          onClick={() => { loadLogs(); loadSummaryStats(); }}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          <FiRefreshCw /> Refresh Logs
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '12px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'inventory' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🩸 Inventory Logs
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '12px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🛡️ System Audit Logs
        </button>
      </div>

      {/* Stats Summary Panel */}
      {activeTab === 'inventory' && invStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {invStats.byOperationType?.slice(0, 4).map((stat) => {
            const style = getOpBadgeStyle(stat._id);
            return (
              <div key={stat._id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: style.bg, color: style.text, fontSize: '1.25rem' }}>
                  <FiActivity />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {stat._id}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.count} log entries
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'audit' && auditSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '1.25rem' }}>
              <FiTrendingUp />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Total Actions Today
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {auditSummary.totalToday || 0}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: '1.25rem' }}>
              <FiUser />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Recent Logins Tracked
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {auditSummary.recentLogins?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BRANCH</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>END DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>

          {activeTab === 'inventory' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>OPERATION</label>
                <select
                  value={opTypeFilter}
                  onChange={(e) => setOpTypeFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="">All Operations</option>
                  {INVENTORY_OPERATIONS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BLOOD GROUP</label>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="">All Groups</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ACTION TYPE</label>
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="">All Actions</option>
                <option value="user_login">User Login</option>
                <option value="user_create">User Registration</option>
                <option value="camp_create">Camp Scheduled</option>
                <option value="camp_register">Donor Registered Camp</option>
                <option value="transfer_initiate">Transfer Initiated</option>
                <option value="transfer_accept">Transfer Approved</option>
                <option value="transfer_reject">Transfer Rejected</option>
                <option value="appointment_create">Appointment Created</option>
                <option value="appointment_status">Appointment Update</option>
              </select>
            </div>
          )}

          <button
            onClick={clearFilters}
            className="btn-ghost"
            style={{ padding: '8px 16px', borderRadius: '0.625rem', fontSize: '0.82rem', cursor: 'pointer', marginTop: 18 }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner text="Searching logs archive..." />
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date & Time</th>
                  {activeTab === 'inventory' ? (
                    <>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Operation</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Blood Group</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Quantity</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Branch</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Performed By</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Reason</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Action</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Actor</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Role</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>IP Address</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Description</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.82rem' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    {activeTab === 'inventory' ? (
                      <>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: getOpBadgeStyle(log.operationType).bg,
                            color: getOpBadgeStyle(log.operationType).text
                          }}>
                            {log.operationType?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4, fontWeight: 700 }}>
                            {log.bloodGroup}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 6, textTransform: 'capitalize' }}>
                            {log.component?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {log.quantity} unit{log.quantity !== 1 ? 's' : ''}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                          {log.branchId?.name || 'Central'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {log.performedBy?.name || 'System'} ({log.performedBy?.role || 'Service'})
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {log.reason || '—'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: log.actionType?.includes('reject') || log.actionType?.includes('cancel') ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: log.actionType?.includes('reject') || log.actionType?.includes('cancel') ? '#ef4444' : '#818cf8'
                          }}>
                            {log.actionType?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                          {log.actorName || log.actor?.name || 'System/Guest'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {log.actorRole || log.actor?.role || 'Visitor'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {log.ipAddress || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {log.description}
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'inventory' ? 7 : 6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No logs archived matching current query parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing page <strong>{page}</strong> of {totalPages} ({total} total entries)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
