import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { HiOutlineChatAlt2, HiX, HiPaperAirplane, HiUser, HiOutlineUserCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AISupportWidget = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  // Widget visibility preferences
  const showWidget = !isAuthenticated || (user?.floatingBotWidgetEnabled !== false);
  const aiEnabled = !isAuthenticated || (user?.aiAssistantEnabled !== false);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState('ai'); // 'ai' | 'agent' | 'closed'
  const [unreadCount, setUnreadCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typewriterIntervalRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping]);

  // Generate / Retrieve Session ID
  useEffect(() => {
    let sid = localStorage.getItem('bbms_chat_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('bbms_chat_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    if (!sessionId || !showWidget || !isOpen) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected to support system:', newSocket.id);
      newSocket.emit('support:join', { sessionId });
      newSocket.emit('support:history', { sessionId });
    });

    newSocket.on('support:history_received', (history) => {
      setMessages(history);
      // Determine session status from last message or defaults
      if (history.length > 0) {
        const lastMsg = history[history.length - 1];
        // Guess status based on messages
        if (history.some(m => m.sender === 'agent')) {
          setChatStatus('agent');
        }
      }
    });

    newSocket.on('support:message_received', (msg) => {
      if (msg.sender === 'ai' || msg.sender === 'agent') {
        setIsGenerating(false);
      }

      if (msg.sender === 'ai') {
        const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        setMessages((prev) => [...prev, { ...msg, text: '', _id: tempId }]);
        
        const words = msg.text.split(' ');
        let wordIndex = 0;
        let currentText = '';
        
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
        
        typewriterIntervalRef.current = setInterval(() => {
          if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
            wordIndex++;
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? { ...m, text: currentText } : m))
            );
          } else {
            if (typewriterIntervalRef.current) {
              clearInterval(typewriterIntervalRef.current);
              typewriterIntervalRef.current = null;
            }
          }
        }, 30);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
      
      // Handle unread badges
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
        // Play soft audio beep or toast
      } else {
        // Automatically send read event if chat is open
        newSocket.emit('support:read', { sessionId, sender: 'user' });
      }
    });

    newSocket.on('support:typing', ({ isTyping, sender }) => {
      if (sender !== 'user') {
        setAgentTyping(isTyping);
      }
    });

    newSocket.on('support:mode_changed', ({ status }) => {
      setChatStatus(status);
      if (status === 'agent') {
        setMessages((prev) => [...prev, {
          sender: 'system',
          text: '🔄 Connecting you to a live support agent...',
          timestamp: new Date()
        }]);
      } else if (status === 'closed') {
        setMessages((prev) => [...prev, {
          sender: 'system',
          text: '✅ Support session resolved and closed.',
          timestamp: new Date()
        }]);
      }
    });

    newSocket.on('support:agent_connected', ({ agentId }) => {
      setChatStatus('agent');
      setAgentTyping(false);
      setMessages((prev) => [...prev, {
        sender: 'system',
        text: '🧑‍💼 A support agent has joined the chat.',
        timestamp: new Date()
      }]);
    });

    return () => {
      newSocket.disconnect();
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, [sessionId, showWidget, isOpen]);

  // Read receipts when opening widget
  useEffect(() => {
    if (isOpen && socket && sessionId) {
      setUnreadCount(0);
      socket.emit('support:read', { sessionId, sender: 'user' });
    }
  }, [isOpen, socket, sessionId, messages.length]);

  if (!showWidget || !aiEnabled) return null;

  const handleStop = () => {
    setIsGenerating(false);
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    toast.error('AI generation stopped.');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const text = inputText.trim();
    setInputText('');

    // Emit message
    socket.emit('support:message', {
      sessionId,
      userId: isAuthenticated ? user.id : null,
      text,
      sender: 'user'
    });

    if (chatStatus === 'ai') {
      setIsGenerating(true);
    }

    // Clear local typing indicators
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('support:typing', { sessionId, isTyping: false, sender: 'user' });
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('support:typing', { sessionId, isTyping: true, sender: 'user' });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('support:typing', { sessionId, isTyping: false, sender: 'user' });
      setIsTyping(false);
    }, 2000);
  };

  const handleRequestHuman = () => {
    if (!socket) return;
    socket.emit('support:request_human', { sessionId });
    toast.success('Live support agent requested. Please wait...');
  };

  const handleResetChat = () => {
    if (window.confirm('Are you sure you want to clear your support chat history?')) {
      const newSid = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('bbms_chat_session_id', newSid);
      setSessionId(newSid);
      setMessages([]);
      setChatStatus('ai');
      toast.success('Chat history cleared!');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, fontFamily: 'var(--font-body)' }}>
      {/* ── Chat Icon Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '3.75rem', height: '3.75rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent, #e11d48), #be123c)',
            border: 'none',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <HiOutlineChatAlt2 style={{ width: '1.8rem', height: '1.8rem' }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-0.2rem', right: '-0.2rem',
              background: '#ef4444', color: 'white',
              fontSize: '0.72rem', fontWeight: 800,
              padding: '0.15rem 0.4rem', borderRadius: '999px',
              border: '2px solid var(--bg-surface, #0f172a)',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            width: 'min(24rem, 90vw)',
            height: 'min(32rem, 80dvh)',
            background: 'var(--bg-surface, #0f172a)',
            border: '1px solid var(--border, #334155)',
            borderRadius: '1.25rem',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(90deg, var(--accent-soft, rgba(225,29,72,0.1)), transparent)',
            borderBottom: '1px solid var(--border, #334155)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '2.25rem', height: '2.25rem',
                borderRadius: '50%',
                background: 'var(--accent, #e11d48)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '1rem',
                boxShadow: '0 0 12px rgba(225, 29, 72, 0.3)'
              }}>
                {chatStatus === 'agent' ? '🧑‍💼' : '🤖'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  {chatStatus === 'agent' ? 'Live Support' : 'BBMS AI'}
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <span style={{ width: '0.35rem', height: '0.35rem', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  {chatStatus === 'agent' ? 'Agent Connected' : 'Strict Healthcare Mode'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={handleResetChat}
                title="Clear Chat History"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer', padding: '0.35rem', borderRadius: '0.5rem', fontSize: '0.85rem'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)'}
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer', padding: '0.35rem', borderRadius: '0.5rem', display: 'flex'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary, #f8fafc)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)'}
              >
                <HiX style={{ width: '1.1rem', height: '1.1rem' }} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, padding: '1rem', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            background: 'var(--bg-base, #0b0f19)'
          }}>
            {/* Greeting */}
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: 'var(--text-secondary, #94a3b8)', fontSize: '0.82rem'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩸</div>
                <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>How can I help you today?</h4>
                <p style={{ marginTop: '0.25rem', lineHeight: 1.4 }}>
                  I can check your donor eligibility, guide you through booking blood donation appointments, explain cooldowns, or locate donation camps.
                </p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={index} style={{
                    alignSelf: 'center', background: 'var(--border, #334155)',
                    color: 'var(--text-primary, #f8fafc)', fontSize: '0.72rem',
                    padding: '0.3rem 0.75rem', borderRadius: '0.5rem', opacity: 0.8
                  }}>
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    background: isUser
                      ? 'var(--accent, #e11d48)'
                      : 'var(--bg-surface)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: isUser ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    fontSize: '0.82rem',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.15rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Thinking / Waiting Bubble */}
            {isGenerating && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="animate-fadeUp">
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '1rem 1rem 1rem 0.2rem',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span>BBMS AI is thinking</span>
                  <span className="thinking-dots" />
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {agentTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>Typing</span>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <span className="dot" style={{ width: '0.3rem', height: '0.3rem', background: 'var(--accent, #e11d48)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }} />
                  <span className="dot" style={{ width: '0.3rem', height: '0.3rem', background: 'var(--accent, #e11d48)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                  <span className="dot" style={{ width: '0.3rem', height: '0.3rem', background: 'var(--accent, #e11d48)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Mode Control Options */}
          {chatStatus === 'ai' && (
            <div style={{
              padding: '0.5rem 1rem', background: 'var(--bg-surface, #0f172a)',
              borderTop: '1px solid var(--border, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>Need live support?</span>
              <button
                onClick={handleRequestHuman}
                style={{
                  background: 'transparent', border: '1px solid var(--accent, #e11d48)',
                  borderRadius: '0.375rem', color: 'var(--accent, #e11d48)',
                  fontSize: '0.68rem', fontWeight: 700, padding: '0.25rem 0.6rem',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent, #e11d48)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent, #e11d48)'; }}
              >
                🙋 Request Human
              </button>
            </div>
          )}

          {/* Footer Input */}
          <form onSubmit={handleSend} style={{
            padding: '0.75rem',
            background: 'var(--bg-surface, #0f172a)',
            borderTop: '1px solid var(--border, #334155)',
            display: 'flex', gap: '0.5rem'
          }}>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={chatStatus === 'closed' ? 'Session closed' : 'Ask about blood eligibility/booking...'}
              disabled={chatStatus === 'closed'}
              style={{
                flex: 1, padding: '0.625rem 0.875rem',
                background: 'var(--bg-base, #0b0f19)',
                border: '1px solid var(--border, #334155)',
                borderRadius: '0.75rem',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
                title="Stop AI Generation"
                style={{
                  width: '2.5rem', height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <HiX style={{ width: '1.1rem', height: '1.1rem' }} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim() || chatStatus === 'closed'}
                style={{
                  width: '2.5rem', height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: 'var(--accent, #e11d48)',
                  border: 'none',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: (!inputText.trim() || chatStatus === 'closed') ? 0.5 : 1,
                  transition: 'all 0.15s'
                }}
              >
                <HiPaperAirplane style={{ width: '1rem', height: '1rem', transform: 'rotate(90deg)' }} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Embedded Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes thinking {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: '....'; }
        }
        .thinking-dots::after {
          content: '';
          animation: thinking 1.6s infinite steps(1);
        }
      `}</style>
    </div>
  );
};

export default AISupportWidget;
