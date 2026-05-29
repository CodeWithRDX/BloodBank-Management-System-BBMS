import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../redux/slices/adminSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineBeaker, HiOutlineClipboardList, HiOutlineHeart } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import usePolling from '../hooks/usePolling';
import { useTheme } from '../theme/ThemeContext';

const TH = ({ children }) => (
  <th style={{
    padding: '1rem 1.25rem',
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

const TD = ({ children, bold }) => (
  <td style={{
    padding: '1rem 1.25rem',
    color: bold ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: bold ? 700 : 500,
    fontSize: '0.85rem'
  }}>
    {children}
  </td>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(s => s.admin);
  const { theme } = useTheme();

  usePolling(() => {
    dispatch(fetchDashboardStats());
  }, 10000);

  if (loading || !stats) return <LoadingSpinner size="lg" text="Loading control panel deck…" />;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fadeIn">
      {/* Header Panel */}
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
            textTransform: 'none'
          }}>
            Super Admin Control Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
            System Core Overlord · Live Network Telemetry
          </p>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: 'var(--btn-radius)',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-glow)',
          color: 'var(--accent)',
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)'
        }}>
          ⏱️ {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.25rem' }}>
        <StatsCard title="Registered Donors" value={stats.totalDonors} icon={HiOutlineHeart} color="red" />
        <StatsCard title="Partner Hospitals" value={stats.totalHospitals} icon={HiOutlineOfficeBuilding} color="purple" />
        <StatsCard title="Stored Blood Units" value={stats.totalInventory} icon={HiOutlineBeaker} color="blue" />
        <StatsCard title="Critical SOS Requests" value={stats.pendingRequests} icon={HiOutlineClipboardList} color="amber" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Blood Stock Chart */}
        <div
          className="glass-card"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
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
            <span>🩸</span> Stored Inventory by Group
          </h3>
          <div style={{ height: '18rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodStockData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="units" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div
          className="glass-card"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
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
            <span>📈</span> Monthly Collection Velocity
          </h3>
          <div style={{ height: '18rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="adminDonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="donations" stroke="var(--accent)" strokeWidth={3} fill="url(#adminDonGrad)" dot={{ r: 5, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Recent Donations */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.92rem', fontFamily: 'var(--font-display)' }}>Recent Donations</h3>
            <span className="badge-accent" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 800 }}>Telemetry (Last 5)</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  <TH>Donor</TH>
                  <TH>Group</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations?.map(d => (
                  <tr key={d._id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <TD bold>{d.donorId?.fullName || 'Anonymous'}</TD>
                    <td style={{ padding: '1rem 1.25rem' }}><BloodGroupBadge group={d.bloodGroup} size="sm" /></td>
                    <TD>{new Date(d.donationDate).toLocaleDateString()}</TD>
                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {(!stats.recentDonations?.length) && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No recent donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.92rem', fontFamily: 'var(--font-display)' }}>Recent SOS Requests</h3>
            <span className="badge-accent" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 800 }}>Telemetry (Last 5)</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  <TH>Patient</TH>
                  <TH>Group</TH>
                  <TH>Quantity</TH>
                  <TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests?.map(r => (
                  <tr key={r._id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <TD bold>{r.patientName}</TD>
                    <td style={{ padding: '1rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                    <TD>{r.quantity} Units</TD>
                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {(!stats.recentRequests?.length) && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No recent request history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
