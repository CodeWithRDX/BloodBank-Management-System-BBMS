import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';
import { FiTrendingUp, FiDroplet, FiUsers, FiMapPin, FiActivity, FiCalendar } from 'react-icons/fi';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const TH = ({ children }) => (
  <th style={{
    padding: '0.875rem 1.25rem',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-display)'
  }}>
    {children}
  </th>
);

const TD = ({ children, bold, color }) => (
  <td style={{
    padding: '0.875rem 1.25rem',
    color: color ? color : (bold ? 'var(--text-primary)' : 'var(--text-secondary)'),
    fontWeight: bold ? 700 : 500,
    fontSize: '0.85rem'
  }}>
    {children}
  </td>
);

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [reqStats, setReqStats] = useState(null);
  const [branchPerf, setBranchPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const { theme } = useTheme();
  const isAnime = theme?.group === 'anime';

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

  const chartTooltip = {
    contentStyle: {
      background: 'var(--bg-elevated)',
      borderColor: 'var(--border)',
      borderRadius: '0.75rem',
      color: 'var(--text-primary)',
      fontSize: '0.8rem',
      boxShadow: 'var(--card-shadow)',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px dashed var(--border)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-display)',
            textTransform: (theme?.id === 'titan' || theme?.id === 'dragonball') ? 'uppercase' : 'none'
          }}>
            Analytics & Operations Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
            System-Wide Clinical Insights & Branch Flow Telemetry
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input"
          style={{ padding: '0.5rem 1.25rem', width: 'auto', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}
        >
          {[2024, 2025, 2026].map((y) => <option key={y} value={y} style={{ background: 'var(--bg-surface)' }}>Year {y}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Recalculating operations database metrics..." />
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: '1.25rem' }}>
            <StatsCard title="Active Branches" value={overview?.activeBranches} icon={FiMapPin} color="red" subtitle={`${overview?.pendingBranches || 0} pending`} />
            <StatsCard title="Registered Donors" value={overview?.totalDonors} icon={FiUsers} color="blue" />
            <StatsCard title="Total Donations" value={overview?.totalDonations} icon={FiDroplet} color="green" />
            <StatsCard title="Total Requests" value={overview?.totalRequests} icon={FiActivity} color="amber" subtitle={`${overview?.pendingRequests || 0} pending`} />
            <StatsCard title="Active Staff" value={overview?.totalStaff} icon={FiUsers} color="purple" />
            <StatsCard title="Upcoming Camps" value={overview?.upcomingCamps} icon={FiCalendar} color="pink" />
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
            {/* Blood Stock Chart */}
            <div
              className={isAnime ? 'anime-card' : 'card'}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '1.75rem',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <h3 style={{
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🩸</span> Blood Inventory Stock level
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stockData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="bloodGroup" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="units" name="Units" radius={[6, 6, 0, 0]}>
                    {stockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Requests Pie Chart */}
            <div
              className={isAnime ? 'anime-card' : 'card'}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '1.75rem',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <h3 style={{
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📋</span> Requests Grouped by Status
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={reqByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={70} paddingAngle={4}>
                      {reqByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: '100px' }}>
                  {reqByStatus.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                  {reqByStatus.length === 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No status requests found</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div
            className={isAnime ? 'anime-card' : 'card'}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <h3 style={{
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '1rem',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-display)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📈</span> Donations Flow Trend Over Months — {year}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)' }} />
                <Line type="monotone" dataKey="count" name="Donations Count" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="units" name="Total Units Collected" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Performance table */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-elevated)'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>🏥 Active Branch Operations & Performance</h3>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)' }}>
                    {['Branch Office', 'City Location', 'Completed Donations', ' SOS Requests', 'Lab Staff count', 'Current Inventory', 'Scheduled Camps'].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branchPerf.map((b) => (
                    <tr key={b.branchId} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                      <TD bold>{b.name}</TD>
                      <TD>{b.city}</TD>
                      <TD color="#10b981">{b.donations}</TD>
                      <TD color="#3b82f6">{b.requests}</TD>
                      <TD>{b.staff}</TD>
                      <TD color="#ef4444" bold>{b.inventory} Units</TD>
                      <TD>{b.camps}</TD>
                    </tr>
                  ))}
                  {branchPerf.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        No branches performance telemetry available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
