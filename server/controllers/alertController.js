const alertService = require('../services/alertService');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const auditLogService = require('../services/auditLogService');

const createAlert = async (req, res, next) => {
  try {
    const alertData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const alert = await alertService.createAlert(alertData);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Alert Created',
      module: 'Alert',
      newValue: alert.toObject(),
      affectedRecordId: alert._id,
      affectedRecordModel: 'Alert',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'new_alert',
        title: `Emergency Alert: ${alert.title}`,
        message: alert.message,
        link: `/dashboard/alerts/${alert._id}`,
        relatedId: alert._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully.',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const { active } = req.query;

    let alerts;
    if (active === 'true' || !req.user) {
      alerts = await alertService.getActiveAlerts();
    } else {
      alerts = await alertService.getAlerts();
    }

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const alert = await alertService.getAlertById(req.params.id);

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const updateAlert = async (req, res, next) => {
  try {
    const oldAlert = await alertService.getAlertById(req.params.id);
    const oldData = {
      title: oldAlert.title,
      priority: oldAlert.priority,
      isActive: oldAlert.isActive,
      affectedDistricts: oldAlert.affectedDistricts,
    };

    const alert = await alertService.updateAlert(req.params.id, req.body);

    let action = 'Alert Updated';
    if (req.body.isActive !== undefined && req.body.isActive !== oldAlert.isActive) {
      action = req.body.isActive ? 'Alert Activated' : 'Alert Deactivated';
    }

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action,
      module: 'Alert',
      oldValue: oldData,
      newValue: alert.toObject(),
      affectedRecordId: alert._id,
      affectedRecordModel: 'Alert',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'alert_updated',
        title: `Alert Updated: ${alert.title}`,
        message: `The emergency alert "${alert.title}" has been updated.`,
        link: `/dashboard/alerts/${alert._id}`,
        relatedId: alert._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully.',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const oldAlert = await alertService.getAlertById(req.params.id);
    const oldData = {
      title: oldAlert.title,
      priority: oldAlert.priority,
      affectedDistricts: oldAlert.affectedDistricts,
    };

    await alertService.deleteAlert(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Alert Deleted',
      module: 'Alert',
      oldValue: oldData,
      affectedRecordId: oldAlert._id,
      affectedRecordModel: 'Alert',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'alert_deleted',
        title: `Alert Deleted: ${oldAlert.title}`,
        message: `The emergency alert "${oldAlert.title}" has been removed.`,
        link: '/dashboard/alerts',
        relatedId: oldAlert._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
};
