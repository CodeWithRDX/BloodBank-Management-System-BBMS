import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { initSocket } from './utils/socketManager.js';
import { startScheduledJobs } from './utils/scheduleJobs.js';
import ChatLog from './models/ChatLog.js';
import { generateAIResponse } from './services/aiService.js';
import { startTelegramBot, registerTelegramSocketHandlers } from './services/telegramBotService.js';
import { registerWhatsAppSocketHandlers } from './services/whatsappBotService.js';


// Route imports — existing
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import testRoutes from './routes/testRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Route imports — new
import branchRoutes from './routes/branchRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import campRoutes from './routes/campRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import logRoutes from './routes/logRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import broadcastRoutes from './routes/broadcastRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import sseRoutes from './routes/sseRoutes.js';


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrl.includes(',') 
  ? clientUrl.split(',').map(url => url.trim()) 
  : clientUrl;

// ─── Socket.IO Setup ────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize global socket manager
initSocket(io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join user-specific room
  socket.on('join:user', (userId) => {
    socket.join(`room:user:${userId}`);
    console.log(`Socket ${socket.id} joined room:user:${userId}`);
  });

  // Join admin room
  socket.on('join:admin', () => {
    socket.join('room:admins');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  // Join branch room (staff + branch_admin)
  socket.on('join:branch', (branchId) => {
    socket.join(`room:branch:${branchId}`);
    console.log(`Socket ${socket.id} joined room:branch:${branchId}`);
  });

  // --- AI Real-Time Support Chat ---
  socket.on('support:join', ({ sessionId }) => {
    socket.join(`support:${sessionId}`);
    console.log(`Socket ${socket.id} joined support room support:${sessionId}`);
  });

  socket.on('support:message', async ({ sessionId, userId, text, sender }) => {
    if (!text || !sessionId) return;
    const msgSender = sender || 'user';
    
    // Save user message to ChatLog
    let chatLog = await ChatLog.findOne({ sessionId });
    if (!chatLog) {
      chatLog = await ChatLog.create({ sessionId, userId: userId || null, status: 'ai', messages: [] });
    }
    const newMsg = { sender: msgSender, text, isRead: false, timestamp: new Date() };
    chatLog.messages.push(newMsg);
    await chatLog.save();

    // Broadcast user/agent message to room
    io.to(`support:${sessionId}`).emit('support:message_received', newMsg);

    // Generate AI response only if status is 'ai' and sender is 'user'
    if (chatLog.status === 'ai' && msgSender === 'user') {
      try {
        const aiResponseText = await generateAIResponse(text, sessionId);
        const aiMsg = { sender: 'ai', text: aiResponseText, isRead: false, timestamp: new Date() };
        chatLog.messages.push(aiMsg);
        await chatLog.save();

        // Emit AI response back to room
        io.to(`support:${sessionId}`).emit('support:message_received', aiMsg);
      } catch (err) {
        console.error('Error generating/saving AI response:', err);
      }
    }
  });

  socket.on('support:typing', ({ sessionId, isTyping, sender }) => {
    socket.to(`support:${sessionId}`).emit('support:typing', { isTyping, sender });
  });

  socket.on('support:read', async ({ sessionId, sender }) => {
    try {
      const chatLog = await ChatLog.findOne({ sessionId });
      if (chatLog) {
        let changed = false;
        chatLog.messages.forEach(m => {
          if (m.sender !== sender && !m.isRead) {
            m.isRead = true;
            m.readAt = new Date();
            changed = true;
          }
        });
        if (changed) {
          await chatLog.save();
        }
        io.to(`support:${sessionId}`).emit('support:read_receipt', { sessionId, sender });
      }
    } catch (err) {
      console.error('Error updating read receipt:', err);
    }
  });

  socket.on('support:request_human', async ({ sessionId }) => {
    try {
      const chatLog = await ChatLog.findOne({ sessionId });
      if (chatLog) {
        chatLog.status = 'agent';
        await chatLog.save();
        io.to(`support:${sessionId}`).emit('support:mode_changed', { status: 'agent' });
        io.to('room:admins').emit('support:agent_requested', { sessionId, userId: chatLog.userId });
      }
    } catch (err) {
      console.error('Error requesting support agent:', err);
    }
  });

  socket.on('support:agent_join', async ({ sessionId, agentId }) => {
    try {
      const chatLog = await ChatLog.findOne({ sessionId });
      if (chatLog) {
        chatLog.agentId = agentId;
        chatLog.status = 'agent';
        await chatLog.save();
        socket.join(`support:${sessionId}`);
        io.to(`support:${sessionId}`).emit('support:agent_connected', { agentId });
      }
    } catch (err) {
      console.error('Error agent joining:', err);
    }
  });

  socket.on('support:close', async ({ sessionId }) => {
    try {
      const chatLog = await ChatLog.findOne({ sessionId });
      if (chatLog) {
        chatLog.status = 'closed';
        chatLog.resolved = true;
        await chatLog.save();
        io.to(`support:${sessionId}`).emit('support:mode_changed', { status: 'closed' });
      }
    } catch (err) {
      console.error('Error closing support room:', err);
    }
  });

  socket.on('support:history', async ({ sessionId }) => {
    try {
      const chatLog = await ChatLog.findOne({ sessionId });
      socket.emit('support:history_received', chatLog ? chatLog.messages : []);
    } catch (err) {
      console.error('Error retrieving support chat history:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Express Middleware ──────────────────────────────────────────────────────

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  validate: { xForwardedForHeader: false },
});
app.use('/api/', limiter);

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// ─── Mount Routes — Existing ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ─── Mount Routes — New ──────────────────────────────────────────────────────
app.use('/api/branches', branchRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/events', sseRoutes);


// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BBMS API is running',
    version: '2.0.0',
    features: ['multi-branch', 'real-time', 'geo-location', 'automated-inventory'],
    timestamp: new Date(),
  });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
  // Start cron jobs after server is live
  startScheduledJobs();
  // Start Telegram Bot update polling
  startTelegramBot();
});

export default app;
