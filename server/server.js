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

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
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
});

export default app;
