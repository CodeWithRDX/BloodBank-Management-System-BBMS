import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../redux/slices/adminSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineBeaker, HiOutlineClipboardList, HiOutlineHeart } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import usePolling from '../hooks/usePolling';

const TH = ({ children }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);
const TD = ({ children, bold }) => (
  <td style={{ padding: '0.875rem 1.25rem', color: bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: bold ? 600 : 400, fontSize: '0.85rem' }}>
    {children}
  </td>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(s => s.admin);

  usePolling(() => {
    dispatch(fetchDashboardStats());
  }, 10000);

  if (loading || !stats) return <LoadingSpinner size="lg" text="Loading dashboard data…" />;

  const bloodStockData = stats.bloodStock?.map(item => ({ name: item._id, units: item.total })) || [];
  const monthlyData = stats.monthlyDonations?.map(item => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return { name: months[item._id.month - 1], donations: item.count };
  }).reverse() || [];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
          System overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: '1rem' }}>
        <StatsCard title="Total Donors"       value={stats.totalDonors}     icon={HiOutlineHeart}        color="red"    />
        <StatsCard title="Hospitals"          value={stats.totalHospitals}  icon={HiOutlineOfficeBuilding} color="purple" />
        <StatsCard title="Blood Units"        value={stats.totalInventory}  icon={HiOutlineBeaker}       color="blue"   />
        <StatsCard title="Pending Requests"   value={stats.pendingRequests} icon={HiOutlineClipboardList} color="amber"  />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.25rem' }}>
        {/* Blood Stock */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            🩸 Blood Stock by Group
          </h3>
          <div style={{ height: '16rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodStockData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="units" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            📈 Monthly Donations
          </h3>
          <div style={{ height: '16rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="donations" stroke="var(--accent)" strokeWidth={2.5} fill="url(#donationGrad)" dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '1.25rem' }}>
        {/* Recent Donations */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Recent Donations</h3>
            <span style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600 }}>Last 5</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH>Donor</TH><TH>Group</TH><TH>Date</TH><TH>Status</TH></tr></thead>
              <tbody>
                {stats.recentDonations?.map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                    <TD bold>{d.donorId?.fullName || 'Unknown'}</TD>
                    <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={d.bloodGroup} size="sm" /></td>
                    <TD>{new Date(d.donationDate).toLocaleDateString()}</TD>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {(!stats.recentDonations?.length) && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No donations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Recent Requests</h3>
            <span style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600 }}>Last 5</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--bg-elevated)' }}><TH>Patient</TH><TH>Group</TH><TH>Qty</TH><TH>Status</TH></tr></thead>
              <tbody>
                {stats.recentRequests?.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                    <TD bold>{r.patientName}</TD>
                    <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                    <TD>{r.quantity}u</TD>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {(!stats.recentRequests?.length) && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No requests found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
