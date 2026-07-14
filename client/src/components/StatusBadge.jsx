const STATUS_MAP = {
  pending:   { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Pending'   },
  approved:  { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Approved'  },
  rejected:  { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'Rejected'  },
  completed: { dot: 'var(--accent-info)',      bg: 'rgba(96, 165, 250, 0.06)',  border: 'rgba(96, 165, 250, 0.15)',  label: 'Completed' },
  cancelled: { dot: 'var(--text-secondary)',   bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)', label: 'Cancelled' },
  scheduled: { dot: 'var(--accent-secondary)', bg: 'rgba(79, 195, 247, 0.06)',  border: 'rgba(79, 195, 247, 0.15)',  label: 'Scheduled' },
  confirmed: { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Confirmed' },
  collected: { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Collected' },
  testing:   { dot: 'var(--accent-inventory)', bg: 'rgba(139, 92, 246, 0.06)',  border: 'rgba(139, 92, 246, 0.15)',  label: 'Testing'   },
  stored:    { dot: 'var(--accent-info)',      bg: 'rgba(96, 165, 250, 0.06)',  border: 'rgba(96, 165, 250, 0.15)',  label: 'Stored'    },
  available: { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Available' },
  reserved:  { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Reserved'  },
  issued:    { dot: 'var(--accent-info)',      bg: 'rgba(96, 165, 250, 0.06)',  border: 'rgba(96, 165, 250, 0.15)',  label: 'Issued'    },
  expired:   { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'Expired'   },
  discarded: { dot: 'var(--text-secondary)',   bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)', label: 'Discarded' },
  safe:      { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Safe'      },
  unsafe:    { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'Unsafe'    },
  active:    { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Active'    },
  inactive:  { dot: 'var(--text-secondary)',   bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)', label: 'Inactive'  },
  no_show:   { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'No Show'   },
  urgent:    { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Urgent'    },
  emergency: { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'Emergency' },
  normal:    { dot: 'var(--accent-info)',      bg: 'rgba(96, 165, 250, 0.06)',  border: 'rgba(96, 165, 250, 0.15)',  label: 'Normal'    },

  // Upgraded Exact-Case & Spaced Statuses
  Pending:             { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Pending' },
  Approved:            { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Approved' },
  Rejected:            { dot: 'var(--accent-emergency)', bg: 'rgba(220, 38, 38, 0.06)',   border: 'rgba(220, 38, 38, 0.15)',   label: 'Rejected' },
  Ongoing:             { dot: 'var(--accent-inventory)', bg: 'rgba(139, 92, 246, 0.06)',  border: 'rgba(139, 92, 246, 0.15)',  label: 'Ongoing' },
  Completed:           { dot: 'var(--accent-info)',      bg: 'rgba(96, 165, 250, 0.06)',  border: 'rgba(96, 165, 250, 0.15)',  label: 'Completed' },
  Cancelled:           { dot: 'var(--text-secondary)',   bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)', label: 'Cancelled' },
  Missed:              { dot: 'var(--text-secondary)',   bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)', label: 'Missed' },
  'Pending Approval':  { dot: 'var(--accent-warning)',   bg: 'rgba(245, 158, 11, 0.06)',  border: 'rgba(245, 158, 11, 0.15)',  label: 'Pending Approval' },
  Attended:            { dot: 'var(--accent-success)',   bg: 'rgba(34, 197, 94, 0.06)',   border: 'rgba(34, 197, 94, 0.15)',   label: 'Attended' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.625rem',
      borderRadius: '999px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: '0.72rem',
      fontWeight: 600,
      color: s.dot,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '0.42rem',
        height: '0.42rem',
        borderRadius: '50%',
        background: s.dot,
        boxShadow: `0 0 5px ${s.dot}`,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {s.label}
    </span>
  );
};

export default StatusBadge;
