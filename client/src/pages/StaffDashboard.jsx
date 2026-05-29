import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests } from '../redux/slices/requestSlice';
import { fetchInventorySummary } from '../redux/slices/inventorySlice';
import { fetchAllAppointments } from '../redux/slices/appointmentSlice';
import { fetchStaff } from '../redux/slices/staffSlice';
import { fetchAllRegistrations } from '../redux/slices/campSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../theme/ThemeContext';
import {
  HiOutlineBeaker, HiOutlineClipboardList,
  HiOutlineShieldCheck, HiOutlineCalendar,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import usePolling from '../hooks/usePolling';

const TH = ({ c }) => (
  <th style={{
    padding: '0.875rem 1.25rem',
    color: 'var(--text-secondary)',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-display)'
  }}>
    {c}
  </th>
);

const TD = ({ children, bold }) => (
  <td style={{
    padding: '0.875rem 1.25rem',
    color: bold ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: bold ? 700 : 500,
    fontSize: '0.85rem'
  }}>
    {children}
  </td>
);

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { requests, loading: rL } = useSelector(s => s.requests);
  const { summary, loading: iL } = useSelector(s => s.inventory);
  const { appointments } = useSelector(s => s.appointments);
  const { staff } = useSelector(s => s.staff);
  const { allRegistrations } = useSelector(s => s.camps);
  const { theme } = useTheme();

  usePolling(() => {
    dispatch(fetchRequests());
    dispatch(fetchInventorySummary());
    dispatch(fetchAllAppointments(''));
    dispatch(fetchStaff({}));
    dispatch(fetchAllRegistrations({ status: 'Pending Approval' }));
  }, 10000);

  const todaysApts = appointments?.filter(a => new Date(a.date).toDateString() === new Date().toDateString()) || [];
  const pendingAptsCount = appointments?.filter(a => a.status === 'Pending').length || 0;
  const pendingCampApprovalsCount = allRegistrations?.filter(r => r.status === 'Pending Approval').length || 0;
  const totalStaff = staff?.length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const totalUnits = summary?.reduce((acc, s) => acc + s.totalUnits, 0) || 0;

  if ((rL || iL) && !summary) return <LoadingSpinner size="lg" text="Syncing lab dashboard..." />;

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
            textTransform: 'none'
          }}>
            Lab & Staff Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Clinical draws, screening tests, and cold-chain inventory management
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
          🧬 Branch Operations Mode
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: '1.25rem' }}>
        <StatsCard title="Pending Appointments" value={pendingAptsCount} icon={HiOutlineCalendar} color="blue" />
        <StatsCard title="Camp Approvals" value={pendingCampApprovalsCount} icon={HiOutlineShieldCheck} color="amber" />
        <StatsCard title="SOS Request Queue" value={pendingRequests} icon={HiOutlineClipboardList} color="red" />
        <StatsCard title="Lab Staff Active" value={totalStaff} icon={HiOutlineUserGroup} color="purple" />
        <StatsCard title="Inventory volume" value={`${totalUnits} Units`} icon={HiOutlineBeaker} color="green" />
      </div>

      {/* Main split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Today's Appointments Checklist */}
        <div
          className={'glass-card'}
          style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            flexShrink: 0,
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
              📅 Today's Draw Queue
            </h3>
            <span className="badge-accent" style={{ padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 800 }}>
              {todaysApts.length} Scheduled
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '20rem' }}>
            {todaysApts.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>No appointments scheduled for today</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {todaysApts.slice(0, 8).map(a => (
                  <li
                    key={a._id}
                    className="table-row"
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                        {a.donorId?.fullName || 'Anonymous Donor'}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ⏱️ Slot: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.timeSlot}</span>
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Cold chain inventory status bars */}
        <div
          className={'glass-card'}
          style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{
            color: 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🩸</span> Stock Reserves Level
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', overflowY: 'auto', flex: 1 }}>
            {summary?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No inventory logs recorded</p>
            ) : (
              (summary || []).map(s => {
                const pct = Math.min((s.totalUnits / 35) * 100, 100);
                const col = s.totalUnits < 6 ? '#f87171' : s.totalUnits < 16 ? '#fbbf24' : '#4ade80';
                return (
                  <div key={s.bloodGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <BloodGroupBadge group={s.bloodGroup} size="xs" />
                      <span style={{ color: col, fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
                        {s.totalUnits} Units
                        {s.totalUnits < 10 && <span style={{ color: '#fbbf24', marginLeft: '0.35rem', fontSize: '0.75rem' }}>⚠️ Critical Low</span>}
                      </span>
                    </div>
                    <div style={{ height: '0.45rem', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${col}, color-mix(in srgb, ${col} 60%, white))`,
                        borderRadius: '999px',
                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Emergency Requests Queue */}
      <div style={{
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-elevated)'
        }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>Pending SOS Request Queue</h3>
          <span className="badge-accent" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 800 }}>{pendingRequests} SOS Pending</span>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <TH c="SOS ID" />
                <TH c="Patient" />
                <TH c="Blood Type" />
                <TH c="Quantity" />
                <TH c="Urgency" />
                <TH c="Request Status" />
              </tr>
            </thead>
            <tbody>
              {requests?.filter(r => r.status === 'pending').slice(0, 10).map(r => (
                <tr key={r._id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    {r.requestId}
                  </td>
                  <TD bold>{r.patientName}</TD>
                  <td style={{ padding: '1rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                  <TD>{r.quantity} Units</TD>
                  <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={r.urgency} /></td>
                  <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {pendingRequests === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    SOS request queue is completely cleared! 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
