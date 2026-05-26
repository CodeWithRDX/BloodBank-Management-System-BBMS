import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllRead } from '../redux/slices/notificationSlice';
import { loadUser } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import API from '../api/axios';
import toast from 'react-hot-toast';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { io } from 'socket.io-client';

const PhoneInput = PhoneInputComponent.default || PhoneInputComponent;

const TYPE_STYLES = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  icon: '✅' },
  warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  icon: '⚠️' },
  error:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', icon: '❌' },
  info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  icon: 'ℹ️' },
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(s => s.notifications);
  const { user } = useSelector(s => s.auth);

  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'channels'
  const [settings, setSettings] = useState({
    telegram: { enabled: false, chatId: '' },
    whatsapp: { enabled: false, phone: '' }
  });

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [telegramLinking, setTelegramLinking] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [simChatId, setSimChatId] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [socket, setSocket] = useState(null);

  // WhatsApp states
  const [whatsappLinking, setWhatsappLinking] = useState(false);
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simulatingWhatsApp, setSimulatingWhatsApp] = useState(false);

  useEffect(() => { 
    dispatch(fetchNotifications()); 
  }, [dispatch]);

  // Socket.IO Listener for Real-Time pairing callback
  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    const s = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(s);

    s.on('connect', () => {
      s.emit('join:user', user._id || user.id);
    });

    s.on('telegram:connected', (data) => {
      if (data.enabled) {
        toast.success('🎉 Telegram paired and connected in real-time!');
        setTelegramLinking(false);
        setTelegramToken('');
        // Reload user Redux profile & settings
        dispatch(loadUser());
        setSettings(prev => ({
          ...prev,
          telegram: { enabled: true, chatId: data.chatId }
        }));
      }
    });

    s.on('whatsapp:connected', (data) => {
      if (data.enabled) {
        toast.success('🎉 WhatsApp paired and connected in real-time!');
        setWhatsappLinking(false);
        setWhatsappToken('');
        // Reload user Redux profile & settings
        dispatch(loadUser());
        setSettings(prev => ({
          ...prev,
          whatsapp: { enabled: true, phone: data.phone }
        }));
      }
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?._id, dispatch]);

  // Fetch settings on tab switch
  useEffect(() => {
    if (activeTab === 'channels') {
      const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
          const { data } = await API.get('/notifications/settings');
          if (data.success && data.data) {
            setSettings({
              telegram: {
                enabled: data.data.telegram?.enabled ?? false,
                chatId: data.data.telegram?.chatId ?? ''
              },
              whatsapp: {
                enabled: data.data.whatsapp?.enabled ?? false,
                phone: data.data.whatsapp?.phone ?? ''
              }
            });
            if (data.data.whatsapp?.phone) {
              setWhatsappPhone(data.data.whatsapp.phone);
            }
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to fetch settings');
        } finally {
          setLoadingSettings(false);
        }
      };
      fetchSettings();
    }
  }, [activeTab]);

  const handleMarkRead = (id) => dispatch(markAsRead(id));
  const handleMarkAll = async () => {
    const res = await dispatch(markAllRead());
    if (res.meta.requestStatus === 'fulfilled') toast.success('All notifications marked as read');
  };

  // Telegram setup link request
  const handleEnableTelegram = async () => {
    const toastId = toast.loading('Generating secure Telegram token...');
    try {
      const { data } = await API.get('/communications/telegram/token');
      if (data.success) {
        setTelegramToken(data.token);
        setTelegramLinking(true);
        toast.success('Connection flow opened in Telegram bot window.', { id: toastId });
        // Open deep link in a new tab
        window.open(data.link, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate token', { id: toastId });
    }
  };

  // Telegram disconnect
  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Disconnect your Telegram notifications?')) return;
    const toastId = toast.loading('Disconnecting Telegram...');
    try {
      const { data } = await API.post('/communications/telegram/disconnect');
      if (data.success) {
        toast.success('Telegram notifications disabled.', { id: toastId });
        setSettings(prev => ({
          ...prev,
          telegram: { enabled: false, chatId: '' }
        }));
        dispatch(loadUser());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect', { id: toastId });
    }
  };

  // WhatsApp setup link request
  const handleEnableWhatsApp = async () => {
    const toastId = toast.loading('Generating secure WhatsApp token...');
    try {
      const { data } = await API.get('/communications/whatsapp/token');
      if (data.success) {
        setWhatsappToken(data.token);
        setWhatsappLink(data.link);
        setWhatsappLinking(true);
        toast.success('Connection flow opened in WhatsApp window.', { id: toastId });
        // Open deep link in a new tab
        window.open(data.link, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate token', { id: toastId });
    }
  };

  // Developer Token simulation pairing helper for WhatsApp
  const handleSimulateWhatsAppPairing = async () => {
    if (!whatsappToken) return toast.error('Generate a WhatsApp token first by clicking Enable.');
    const targetPhone = simPhone.trim();
    if (!targetPhone) return toast.error('Please enter a mock phone number.');

    setSimulatingWhatsApp(true);
    const toastId = toast.loading('Simulating WhatsApp message payload...');
    try {
      if (socket && socket.connected) {
        socket.emit('whatsapp:bot_message', {
          text: `start ${whatsappToken}`,
          phone: targetPhone
        });
        toast.success('Simulated pairing event emitted via Socket.IO!', { id: toastId });
        setSimPhone('');
      } else {
        const { data } = await API.post('/communications/whatsapp/simulate', {
          token: whatsappToken,
          phone: targetPhone
        });
        if (data.success) {
          toast.success('Simulated pairing successful via API fallback!', { id: toastId });
          setSimPhone('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed', { id: toastId });
    } finally {
      setSimulatingWhatsApp(false);
    }
  };

  // WhatsApp disconnect
  const handleDisconnectWhatsApp = async () => {
    if (!window.confirm('Disconnect your WhatsApp notifications?')) return;
    const toastId = toast.loading('Disconnecting WhatsApp...');
    try {
      const { data } = await API.post('/communications/whatsapp/disconnect');
      if (data.success) {
        toast.success('WhatsApp alerts disabled.', { id: toastId });
        setSettings(prev => ({
          ...prev,
          whatsapp: { enabled: false, phone: '' }
        }));
        dispatch(loadUser());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect', { id: toastId });
    }
  };

  // Developer Token simulation pairing helper
  const handleSimulatePairing = async () => {
    if (!telegramToken) return toast.error('Generate a Telegram token first by clicking Enable.');
    const targetChatId = simChatId.trim() || '12345678';
    
    setSimulating(true);
    const toastId = toast.loading('Simulating `/start` command payload...');
    try {
      if (socket && socket.connected) {
        socket.emit('telegram:bot_message', {
          text: `/start ${telegramToken}`,
          chatId: targetChatId
        });
        toast.success('Simulated pairing event emitted via Socket.IO!', { id: toastId });
        setSimChatId('');
      } else {
        const { data } = await API.post('/communications/telegram/simulate', {
          token: telegramToken,
          chatId: targetChatId
        });
        if (data.success) {
          toast.success('Simulated pairing successful via API fallback!', { id: toastId });
          setSimChatId('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed', { id: toastId });
    } finally {
      setSimulating(false);
    }
  };

  const t = (type) => TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div style={{ maxWidth: '44rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Manage in-app notifications and external alert channels
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        gap: '1rem',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('inbox')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'inbox' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'inbox' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'inbox' ? 700 : 500,
            fontSize: '0.9rem',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📥 Inbox ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'channels' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'channels' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'channels' ? 700 : 500,
            fontSize: '0.9rem',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ⚙️ Notification Channels
        </button>
      </div>

      {/* Inbox Tab Content */}
      {activeTab === 'inbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            </div>
          )}

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
      )}

      {/* Channels Settings Tab Content */}
      {activeTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loadingSettings ? (
            <LoadingSpinner text="Fetching notification channels settings..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Telegram Settings Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🤖</span>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Telegram Bot Integration</h3>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Receive instant notifications via Telegram</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.5rem',
                    background: settings.telegram.enabled ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${settings.telegram.enabled ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    color: settings.telegram.enabled ? '#4ade80' : '#f87171'
                  }}>
                    {settings.telegram.enabled ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {settings.telegram.enabled ? (
                    <div>
                      <div style={{
                        padding: '0.75rem',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.625rem',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem'
                      }}>
                        ✅ Connected to Telegram Chat ID: <b>{settings.telegram.chatId}</b>. You will receive real-time donation request matches, updates and appointment notifications here.
                      </div>
                      <button
                        onClick={handleDisconnectTelegram}
                        className="btn-primary"
                        style={{ background: '#ef4444', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', borderRadius: '0.5rem' }}
                      >
                        Disconnect Telegram Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Linking your Telegram allows our automated bot to send notifications. No manual Chat ID needed. Simply click the button below to pair:
                      </p>
                      
                      {!telegramLinking ? (
                        <button
                          onClick={handleEnableTelegram}
                          className="btn-primary"
                          style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Enable Telegram Notifications
                        </button>
                      ) : (
                        <div style={{
                          padding: '1rem',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--accent-glow)',
                          borderRadius: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}>
                            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(225,29,72,0.3)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
                            Waiting for bot start confirmation...
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            We have opened the Telegram connection flow in a new tab. If it did not open, you can click <a href={`https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'SmartBBMSBot'}?start=${telegramToken}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>this link</a>.
                          </p>

                          {/* Sandbox simulation */}
                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                              ⚠️ <b>Local Sandbox Testing:</b> Simulate the bot receiving your start request:
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="Mock Chat ID (default 12345678)"
                                value={simChatId}
                                onChange={e => setSimChatId(e.target.value)}
                                style={{
                                  padding: '0.4rem 0.6rem', fontSize: '0.75rem',
                                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                                  borderRadius: '0.5rem', color: 'var(--text-primary)', width: '12rem'
                                }}
                              />
                              <button
                                type="button"
                                disabled={simulating}
                                onClick={handleSimulatePairing}
                                style={{
                                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                  color: 'var(--text-primary)', padding: '0.4rem 0.75rem',
                                  fontSize: '0.72rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                                }}
                              >
                                {simulating ? 'Processing...' : 'Simulate Bot /start'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Settings Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>💬</span>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>WhatsApp Alerts</h3>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Receive instant notifications via WhatsApp</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.5rem',
                    background: settings.whatsapp.enabled ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${settings.whatsapp.enabled ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    color: settings.whatsapp.enabled ? '#4ade80' : '#f87171'
                  }}>
                    {settings.whatsapp.enabled ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {settings.whatsapp.enabled ? (
                    <div>
                      <div style={{
                        padding: '0.75rem',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.625rem',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem'
                      }}>
                        ✅ Connected to WhatsApp Number: <b>+{settings.whatsapp.phone}</b>. Critical notification broadcasts will print here.
                      </div>
                      <button
                        onClick={handleDisconnectWhatsApp}
                        className="btn-primary"
                        style={{ background: '#ef4444', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', borderRadius: '0.5rem' }}
                      >
                        Disconnect WhatsApp Alerts
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Linking your WhatsApp allows our automated bot to send notifications. Simply click the button below to pair:
                      </p>
                      
                      {!whatsappLinking ? (
                        <button
                          onClick={handleEnableWhatsApp}
                          className="btn-primary"
                          style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          Enable WhatsApp Notifications
                        </button>
                      ) : (
                        <div style={{
                          padding: '1rem',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--accent-glow)',
                          borderRadius: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}>
                            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(225,29,72,0.3)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
                            Waiting for bot start confirmation...
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            We have opened the WhatsApp connection flow in a new tab. If it did not open, you can click <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>this link</a>.
                          </p>

                          {/* Sandbox simulation */}
                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                              ⚠️ <b>Local Sandbox Testing:</b> Simulate the bot receiving your start request:
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="Mock Phone (e.g. 919876543210)"
                                value={simPhone}
                                onChange={e => setSimPhone(e.target.value)}
                                style={{
                                  padding: '0.4rem 0.6rem', fontSize: '0.75rem',
                                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                                  borderRadius: '0.5rem', color: 'var(--text-primary)', width: '12rem'
                                }}
                              />
                              <button
                                type="button"
                                disabled={simulatingWhatsApp}
                                onClick={handleSimulateWhatsAppPairing}
                                style={{
                                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                  color: 'var(--text-primary)', padding: '0.4rem 0.75rem',
                                  fontSize: '0.72rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                                }}
                              >
                                {simulatingWhatsApp ? 'Processing...' : 'Simulate Bot start'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Notifications;
