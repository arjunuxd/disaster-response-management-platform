const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const config = require('./config');
const connectDB = require('./config/db');

const { errorHandler } = require('./middleware');

const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const alertRoutes = require('./routes/alertRoutes');
const riskZoneRoutes = require('./routes/riskZoneRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const disasterTypeRoutes = require('./routes/disasterTypeRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');

// ======================================================
// Initialize Express
// ======================================================

const app = express();

// ======================================================
// Security Headers
// ======================================================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// ======================================================
// Rate Limiter
// ======================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

app.use('/api', apiLimiter);

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, Render health checks, etc.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`❌ Blocked by CORS: ${origin}`);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
    ],
    optionsSuccessStatus: 200,
  })
);

// ======================================================
// Body Parser
// ======================================================

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ======================================================
// Security
// ======================================================

app.use(mongoSanitize());
app.use(hpp());

// ======================================================
// Static Uploads
// ======================================================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================================================
// API Routes
// ======================================================

app.use('/api', routes);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/risk-zones', riskZoneRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/disaster-types', disasterTypeRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/geocode', geocodeRoutes);

// ======================================================
// Root Route
// ======================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DRMP API Running Successfully',
  });
});

// ======================================================
// 404 Handler
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ======================================================
// Error Handler
// ======================================================

app.use(errorHandler);

// ======================================================
// Start Server
// ======================================================

const startServer = async () => {
  try {
    await connectDB();

    const disasterTypeService = require('./services/disasterTypeService');
    await disasterTypeService.seedDefaults();

    app.listen(config.port, () => {
      console.log('\n===========================================');
      console.log('🚀 DRMP API SERVER STARTED');
      console.log('===========================================');
      console.log(`Environment : ${config.nodeEnv}`);
      console.log(`Port        : ${config.port}`);
      console.log(`Client URL  : ${process.env.CLIENT_URL}`);
      console.log(`API URL     : http://localhost:${config.port}/api`);
      console.log('===========================================\n');
    });
  } catch (err) {
    console.error('Server Startup Failed');
    console.error(err);
    process.exit(1);
  }
};

startServer();