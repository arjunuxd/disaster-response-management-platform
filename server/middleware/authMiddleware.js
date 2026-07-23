const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized. No token provided.');
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token has expired.'));
    } else {
      next(error);
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized to access this route.`)
      );
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // ignore — proceed without req.user
  }
  next();
};

module.exports = { protect, authorize, optionalProtect };
