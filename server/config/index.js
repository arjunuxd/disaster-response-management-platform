const dotenv = require('dotenv');
const path = require('path');

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  session: {
    user: '7d',
    admin: '72h',
  },
};
