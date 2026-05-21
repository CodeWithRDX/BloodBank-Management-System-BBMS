import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllRead } from '../redux/slices/notificationSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  icon: '✅' },
  warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  icon: '⚠️' },
  error:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', icon: '❌' },
  info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  icon: 'ℹ️' },
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(s => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkRead = (id) => dispatch(markAsRead(id));
  const handleMarkAll = async () => {
    const res = await dispatch(markAllRead());
    if (res.meta.requestStatus === 'fulfilled') toast.success('All notifications marked as read');
  };

  const t = (type) => TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div style={{ maxWidth: '44rem', margin: '0 auto' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {unreadCount > 0
              ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{unreadCount} unread</span>
              : '🎉 All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <HiOutlineCheckCircle style={{ width: '1rem', height: '1rem' }} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Content */}
      {loading && items.length === 0 ? (
        <LoadingSpinner text="Loading notifications…" />
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '1.25rem', boxShadow: 'var(--card-shadow)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No Notifications
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            You're all caught up. New alerts will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {items.map((n, i) => {
            const s = t(n.type);
            return (
              <div
                key={n._id}
                className={`animate-fadeUp delay-${['75','150','300'][i % 3]}`}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  padding: '1.125rem 1.25rem',
                  background: n.isRead ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                  border: `1px solid ${n.isRead ? 'var(--border)' : s.border}`,
                  borderRadius: '1rem',
                  opacity: n.isRead ? 0.65 : 1,
                  transition: 'all 0.2s',
                  boxShadow: n.isRead ? 'none' : 'var(--card-shadow)',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '2.25rem', height: '2.25rem', flexShrink: 0,
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: '0.625rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>
                  {s.icon}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 5px var(--accent-glow)' }} />
                      )}
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem', lineHeight: 1.6 }}>
                    {n.message}
                  </p>
                  {n.category && (
                    <span style={{
                      display: 'inline-block', marginTop: '0.5rem',
                      padding: '0.15rem 0.5rem', borderRadius: '0.375rem',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {n.category}
                    </span>
                  )}
                </div>

                {/* Mark read btn */}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    title="Mark as read"
                    style={{
                      padding: '0.35rem', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)', borderRadius: '0.5rem',
                      cursor: 'pointer', color: 'var(--text-secondary)',
                      display: 'flex', flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)'; e.currentTarget.style.color = '#4ade80'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <HiOutlineCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
