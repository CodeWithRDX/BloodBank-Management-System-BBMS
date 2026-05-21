import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests } from '../redux/slices/requestSlice';
import { fetchInventorySummary } from '../redux/slices/inventorySlice';
import { fetchAllAppointments } from '../redux/slices/appointmentSlice';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import {
  HiOutlineBeaker, HiOutlineClipboardList,
  HiOutlineShieldCheck, HiOutlineCalendar,
} from 'react-icons/hi';

import usePolling from '../hooks/usePolling';

const TH = ({ c }) => (
  <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>
);
const TD = ({ children }) => (
  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{children}</td>
);

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { requests, loading: rL } = useSelector(s => s.requests);
  const { summary, loading: iL } = useSelector(s => s.inventory);
  const { appointments } = useSelector(s => s.appointments);

  usePolling(() => {
    dispatch(fetchRequests());
    dispatch(fetchInventorySummary());
    dispatch(fetchAllAppointments('status=scheduled'));
  }, 10000);

  const todaysApts = appointments?.filter(a => new Date(a.date).toDateString() === new Date().toDateString()) || [];
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const lowStock = summary?.filter(s => s.totalUnits < 10) || [];
  const totalUnits = summary?.reduce((acc, s) => acc + s.totalUnits, 0) || 0;

  if ((rL || iL) && !summary) return <LoadingSpinner size="lg" text="Loading staff dashboard…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
          Staff Dashboard 🧪
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Blood collections, screening and inventory overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatsCard title="Today's Appointments" value={todaysApts.length}  icon={HiOutlineCalendar}     color="blue"   />
        <StatsCard title="Pending Requests"      value={pendingRequests}    icon={HiOutlineClipboardList} color="red"    />
        <StatsCard title="Low-Stock Groups"      value={lowStock.length}    icon={HiOutlineShieldCheck}  color="amber"  />
        <StatsCard title="Total Blood Units"     value={totalUnits}         icon={HiOutlineBeaker}       color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Today's appointments */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>📅 Today's Appointments</h3>
            <span style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
              {todaysApts.length}
            </span>
          </div>
          {todaysApts.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No appointments today</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {todaysApts.slice(0, 8).map(a => (
                <li key={a._id} style={{
                  padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.15s', gap: '0.5rem', flexWrap: 'wrap',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {a.donorId?.fullName || 'Donor'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>🕐 {a.timeSlot}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Blood stock overview */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>🩸 Blood Stock</h3>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(summary || []).map(s => {
              const pct = Math.min((s.totalUnits / 30) * 100, 100);
              const col = s.totalUnits < 5 ? '#f87171' : s.totalUnits < 15 ? '#fbbf24' : '#4ade80';
              return (
                <div key={s.bloodGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <BloodGroupBadge group={s.bloodGroup} size="sm" />
                    <span style={{ color: col, fontWeight: 700, fontSize: '0.82rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {s.totalUnits} units
                      {s.totalUnits < 10 && <span style={{ color: '#fbbf24', marginLeft: '0.3rem', fontSize: '0.7rem' }}>⚠</span>}
                    </span>
                  </div>
                  <div style={{ height: '0.3rem', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending requests table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Pending Blood Requests</h3>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{pendingRequests} pending</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <TH c="Request ID" /><TH c="Patient" /><TH c="Group" /><TH c="Qty" /><TH c="Urgency" /><TH c="Status" />
              </tr>
            </thead>
            <tbody>
              {requests?.filter(r => r.status === 'pending').slice(0, 10).map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{r.requestId}</td>
                  <TD>{r.patientName}</TD>
                  <td style={{ padding: '0.875rem 1.25rem' }}><BloodGroupBadge group={r.bloodGroup} size="sm" /></td>
                  <TD>{r.quantity}u</TD>
                  <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.urgency} /></td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {!pendingRequests && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No pending requests 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
