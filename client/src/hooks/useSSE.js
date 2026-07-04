import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addNotification } from '../redux/slices/notificationSlice';

// Global Event listener registry for dynamic component registration
const sseListeners = {};

/**
 * Register a listener for an SSE event type
 */
export const addSSEListener = (event, callback) => {
  if (!sseListeners[event]) {
    sseListeners[event] = [];
  }
  sseListeners[event].push(callback);
};

/**
 * Unregister a listener for an SSE event type
 */
export const removeSSEListener = (event, callback) => {
  if (!sseListeners[event]) return;
  sseListeners[event] = sseListeners[event].filter(cb => cb !== callback);
};

/**
 * Custom hook to manage the lifecycle of a global Server-Sent Events (SSE) connection.
 * Instantiates the connection only when a user is logged in.
 */
export default function useSSE() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user || (!user._id && !user.id)) {
      if (eventSourceRef.current) {
        console.log('📡 [SSE] Closing connection (user logged out)');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('token') || '';
    if (!token) return;

    const baseApiUrl = import.meta.env.VITE_API_URL || '/api';
    // Establish connection, passing token in query parameters for EventSource authentication
    const sseUrl = `${baseApiUrl}/events?token=${token}`;
    
    console.log('📡 [SSE] Opening connection...');
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    const triggerCallbacks = (event, data) => {
      if (sseListeners[event]) {
        sseListeners[event].forEach(cb => {
          try {
            cb(data);
          } catch (err) {
            console.error(`Error in SSE callback for event: ${event}`, err);
          }
        });
      }
    };

    // Generic connection message
    es.onmessage = (e) => {
      console.log('📡 [SSE] Message:', e.data);
    };

    // Connection error handler
    es.onerror = (err) => {
      console.error('📡 [SSE] Connection error:', err);
    };

    // ─── Event Listeners ──────────────────────────────────────────────────────

    // New notification broadcasted by server
    es.addEventListener('notification:new', (e) => {
      try {
        const notification = JSON.parse(e.data);
        dispatch(addNotification(notification));
        
        // Pop alert toast
        toast.info(`🔔 ${notification.title}: ${notification.message}`, {
          duration: 6000,
          position: 'top-right',
        });

        triggerCallbacks('notification:new', notification);
      } catch (err) {
        console.error('Error handling notification:new SSE payload', err);
      }
    });

    // Telegram Bot pairing successful
    es.addEventListener('telegram:connected', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('telegram:connected', data);
      } catch (err) {
        console.error(err);
      }
    });

    // WhatsApp Bot pairing successful
    es.addEventListener('whatsapp:connected', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('whatsapp:connected', data);
      } catch (err) {
        console.error(err);
      }
    });

    // Low stock alert trigger
    es.addEventListener('inventory:low_stock', (e) => {
      try {
        const data = JSON.parse(e.data);
        toast.error(`🚨 Low Stock: ${data.bloodGroup} in branch is at ${data.quantity} units!`, {
          duration: 7000,
        });
        triggerCallbacks('inventory:low_stock', data);
      } catch (err) {
        console.error(err);
      }
    });

    // Blood Inventory balance change
    es.addEventListener('inventory:updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('inventory:updated', data);
      } catch (err) {
        console.error(err);
      }
    });

    // Blood Request update (approval/fulfillment)
    es.addEventListener('request:updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('request:updated', data);
      } catch (err) {
        console.error(err);
      }
    });

    // Donation camp creation / registration
    es.addEventListener('camp:registration', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('camp:registration', data);
      } catch (err) {
        console.error(err);
      }
    });

    // Inter-branch transfers status updates
    es.addEventListener('transfer:new', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('transfer:new', data);
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener('transfer:completed', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('transfer:completed', data);
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener('branch:status_changed', (e) => {
      try {
        const data = JSON.parse(e.data);
        triggerCallbacks('branch:status_changed', data);
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
      console.log('📡 [SSE] Connection closed');
    };
  }, [user?._id, user?.id, dispatch]);
}
