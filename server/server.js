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

// ─────────────────────────────────────────────
// Initialize Express App
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

app.use('/api', apiLimiter);

// ─────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────
const corsOptions = {
  origin: config.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ─────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ─────────────────────────────────────────────
// Security Sanitization
// ─────────────────────────────────────────────
app.use(mongoSanitize());
app.use(hpp());

// ─────────────────────────────────────────────
// Static Files (uploads)
// ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
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
app.use('/api/geocode', require('./routes/geocodeRoutes'));

// ─────────────────────────────────────────────
// Health check at root
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API Running Successfully' });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  const disasterTypeService = require('./services/disasterTypeService');
  await disasterTypeService.seedDefaults();

  app.listen(config.port, () => {
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║       DRMP – API Server                 ║`);
    console.log(`╠══════════════════════════════════════════╣`);
    console.log(`║  Environment : ${config.nodeEnv.padEnd(26)}║`);
    console.log(`║  Port        : ${String(config.port).padEnd(26)}║`);
    console.log(`║  CORS Origin : ${config.clientUrl.padEnd(26)}║`);
    console.log(`╚══════════════════════════════════════════╝`);
    console.log(`\n→ Server running at http://localhost:${config.port}`);
    console.log(`→ API test at http://localhost:${config.port}/api`);
  });
};

startServer();
