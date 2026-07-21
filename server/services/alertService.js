const Alert = require('../models/Alert');
const ApiError = require('../utils/ApiError');

const createAlert = async (alertData) => {
  const alert = await Alert.create(alertData);
  return alert.populate('createdBy', 'fullName email');
};

const getAlerts = async () => {
  const alerts = await Alert.find()
    .populate('createdBy', 'fullName email')
    .sort('-createdAt');
  return alerts;
};

const getActiveAlerts = async () => {
  const alerts = await Alert.find({ isActive: true, expiresAt: { $gt: new Date() } })
    .populate('createdBy', 'fullName email')
    .sort('-priority');
  return alerts;
};

const getAlertById = async (alertId) => {
  const alert = await Alert.findById(alertId)
    .populate('createdBy', 'fullName email');

  if (!alert) {
    throw new ApiError(404, 'Alert not found.');
  }

  return alert;
};

const updateAlert = async (alertId, updateData) => {
  const alert = await Alert.findByIdAndUpdate(alertId, updateData, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'fullName email');

  if (!alert) {
    throw new ApiError(404, 'Alert not found.');
  }

  return alert;
};

const deleteAlert = async (alertId) => {
  const alert = await Alert.findByIdAndDelete(alertId);

  if (!alert) {
    throw new ApiError(404, 'Alert not found.');
  }

  return alert;
};

module.exports = {
  createAlert,
  getAlerts,
  getActiveAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
};
