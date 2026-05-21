import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import API from '../api/axios';
import { FiTrendingUp, FiDroplet, FiUsers, FiMapPin, FiActivity, FiCalendar } from 'react-icons/fi';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  </div>
);

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [reqStats, setReqStats] = useState(null);
  const [branchPerf, setBranchPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAll();
  }, [year]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ov, mo, rq, bp] = await Promise.all([
        API.get('/analytics/overview'),
        API.get('/analytics/donations/monthly', { params: { year } }),
        API.get('/analytics/requests/stats'),
        API.get('/analytics/branches/performance'),
      ]);
      setOverview(ov.data.data);
      setMonthly(mo.data.data);
      setReqStats(rq.data.data);
      setBranchPerf(bp.data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const reqByStatus = reqStats?.byStatus?.map((s) => ({ name: s._id, value: s.count })) || [];
  const stockData = overview?.stockByGroup || [];

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📊 Analytics & Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Real-time insights across all branches
          </p>
        </div>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer' }}>
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading analytics...</div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard title="Active Branches" value={overview?.activeBranches} icon={<FiMapPin />} color="#ef4444" subtitle={`${overview?.pendingBranches} pending`} />
            <StatCard title="Total Donors" value={overview?.totalDonors} icon={<FiUsers />} color="#3b82f6" />
            <StatCard title="Total Donations" value={overview?.totalDonations} icon={<FiDroplet />} color="#10b981" />
            <StatCard title="Total Requests" value={overview?.totalRequests} icon={<FiActivity />} color="#f59e0b" subtitle={`${overview?.pendingRequests} pending`} />
            <StatCard title="Active Staff" value={overview?.totalStaff} icon={<FiUsers />} color="#8b5cf6" />
            <StatCard title="Upcoming Camps" value={overview?.upcomingCamps} icon={<FiCalendar />} color="#ec4899" />
          </div>

          {/* Blood Stock Bar Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>🩸 Blood Stock by Group</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stockData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="bloodGroup" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="units" name="Units" radius={[4, 4, 0, 0]}>
                    {stockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Request Status Pie */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Requests by Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={reqByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                      {reqByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reqByStatus.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Donations Line Chart */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📈 Monthly Donations — {year}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="count" name="Donations" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="units" name="Units Collected" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Performance Table */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>🏥 Branch Performance</h3>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Branch', 'City', 'Donations', 'Requests', 'Staff', 'Inventory', 'Camps'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branchPerf.slice(0, 10).map((b) => (
                    <tr key={b.branchId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{b.name}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.city}</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ color: '#10b981', fontWeight: 700 }}>{b.donations}</span></td>
                      <td style={{ padding: '10px 16px' }}><span style={{ color: '#3b82f6', fontWeight: 700 }}>{b.requests}</span></td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{b.staff}</td>
                      <td style={{ padding: '10px 16px' }}><span style={{ color: '#ef4444', fontWeight: 700 }}>{b.inventory}u</span></td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{b.camps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
