const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const notificationService = require('../services/notificationService');
const auditLogService = require('../services/auditLogService');

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Please provide fullName, email, and password.');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'An account with this email already exists.');
    }

    const user = await User.create({ fullName, email, password });

    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await notificationService.createNotification({
        user: admin._id,
        type: 'new_user',
        title: 'New User Registered',
        message: `${fullName} has joined DRMP.`,
        link: '/admin/users',
        relatedId: user._id,
      });
    }

    const token = user.generateJwtToken();

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = user.generateJwtToken();

    if (user.role === 'admin') {
      await auditLogService.log({
        adminId: user._id,
        adminName: user.fullName,
        action: 'Admin Login',
        module: 'Auth',
        ipAddress: req.ip,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const updateFields = {};

    if (fullName !== undefined) updateFields.fullName = fullName;
    if (phone !== undefined) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    if (user.role === 'admin') {
      await auditLogService.log({
        adminId: user._id,
        adminName: user.fullName,
        action: 'Settings Updated',
        module: 'Settings',
        oldValue: { fullName: req.user.fullName, phone: req.user.phone },
        newValue: updateFields,
        affectedRecordId: user._id,
        affectedRecordModel: 'User',
        ipAddress: req.ip,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide current password and new password.');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters.');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    await notificationService.createNotification({
      user: user._id,
      type: 'account_update',
      title: 'Password Changed',
      message: 'Your account password was changed successfully.',
      link: '/profile',
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
