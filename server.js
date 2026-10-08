const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import API routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();

// ── Node.js Logging Setup ──────────────────────────────────────────────────
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'bookings.log'),
  { flags: 'a' }
);

app.locals.logStream = accessLogStream;

app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://localconnect-mhkn.onrender.com'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString(),
    service: 'LocalConnect API',
  });
});

// ── Serve Frontend or Root Health Response ──────────────────────────────────
const frontendPath = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(frontendPath)) {
  // If Vite build output exists in /frontend/dist
  app.use(express.static(frontendPath));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Root API response (Fixes "Cannot GET /" when accessing primary URL)
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: '🚀 LocalConnect API is live and running',
      endpoints: {
        auth: '/api/auth',
        services: '/api/services',
        bookings: '/api/bookings',
        reviews: '/api/reviews',
        users: '/api/users',
        ai: '/api/ai',
        health: '/api/health',
      },
    });
  });
}

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 LocalConnect API running on http://localhost:${PORT}`);
  const startMsg = Buffer.from(`[${new Date().toISOString()}] Server started on port ${PORT}\n`);
  accessLogStream.write(startMsg);
});
