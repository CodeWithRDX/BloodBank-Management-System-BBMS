const STATUS_MAP = {
  pending:   { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   label: 'Pending'   },
  approved:  { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   label: 'Approved'  },
  rejected:  { dot: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  label: 'Rejected'  },
  completed: { dot: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',   label: 'Completed' },
  cancelled: { dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'Cancelled' },
  scheduled: { dot: '#22d3ee', bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.3)',   label: 'Scheduled' },
  confirmed: { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   label: 'Confirmed' },
  collected: { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   label: 'Collected' },
  testing:   { dot: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)',  label: 'Testing'   },
  stored:    { dot: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',   label: 'Stored'    },
  available: { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   label: 'Available' },
  reserved:  { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   label: 'Reserved'  },
  issued:    { dot: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',   label: 'Issued'    },
  expired:   { dot: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  label: 'Expired'   },
  discarded: { dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'Discarded' },
  safe:      { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   label: 'Safe'      },
  unsafe:    { dot: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  label: 'Unsafe'    },
  active:    { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   label: 'Active'    },
  inactive:  { dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'Inactive'  },
  no_show:   { dot: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  label: 'No Show'   },
  urgent:    { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   label: 'Urgent'    },
  emergency: { dot: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  label: 'Emergency' },
  normal:    { dot: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',   label: 'Normal'    },

  // Upgraded Exact-Case & Spaced Statuses
  Pending:             { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label: 'Pending' },
  Approved:            { dot: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', label: 'Approved' },
  Rejected:            { dot: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'Rejected' },
  Ongoing:             { dot: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', label: 'Ongoing' },
  Completed:           { dot: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', label: 'Completed' },
  Cancelled:           { dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'Cancelled' },
  Missed:              { dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'Missed' },
  'Pending Approval':  { dot: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label: 'Pending Approval' },
  Attended:            { dot: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: 'Attended' },
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
