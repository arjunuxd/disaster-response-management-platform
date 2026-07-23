const riskZoneService = require('../services/riskZoneService');
const auditLogService = require('../services/auditLogService');
const notificationService = require('../services/notificationService');
const User = require('../models/User');

const createRiskZone = async (req, res, next) => {
  try {
    const zoneData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const zone = await riskZoneService.createRiskZone(zoneData);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Risk Zone Created',
      module: 'RiskZone',
      newValue: zone.toObject(),
      affectedRecordId: zone._id,
      affectedRecordModel: 'RiskZone',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'new_risk_zone',
        title: `New Risk Zone: ${zone.zoneName}`,
        message: `A new ${zone.riskLevel} risk zone has been established in ${zone.district || 'the area'}.`,
        link: '/dashboard/map',
        relatedId: zone._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Risk zone created successfully.',
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

const getRiskZones = async (req, res, next) => {
  try {
    const zones = await riskZoneService.getRiskZones();

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    next(error);
  }
};

const getRiskZoneById = async (req, res, next) => {
  try {
    const zone = await riskZoneService.getRiskZoneById(req.params.id);

    res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

const updateRiskZone = async (req, res, next) => {
  try {
    const oldZone = await riskZoneService.getRiskZoneById(req.params.id);
    const oldData = {
      zoneName: oldZone.zoneName,
      riskLevel: oldZone.riskLevel,
    };

    const zone = await riskZoneService.updateRiskZone(req.params.id, req.body);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Risk Zone Updated',
      module: 'RiskZone',
      oldValue: oldData,
      newValue: zone.toObject(),
      affectedRecordId: zone._id,
      affectedRecordModel: 'RiskZone',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'risk_zone_updated',
        title: `Risk Zone Updated: ${zone.zoneName}`,
        message: `The risk zone "${zone.zoneName}" has been updated. Risk level: ${zone.riskLevel}.`,
        link: '/dashboard/map',
        relatedId: zone._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Risk zone updated successfully.',
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRiskZone = async (req, res, next) => {
  try {
    const oldZone = await riskZoneService.getRiskZoneById(req.params.id);
    const oldData = {
      zoneName: oldZone.zoneName,
      riskLevel: oldZone.riskLevel,
      district: oldZone.district,
    };

    await riskZoneService.deleteRiskZone(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Risk Zone Deleted',
      module: 'RiskZone',
      oldValue: oldData,
      affectedRecordId: oldZone._id,
      affectedRecordModel: 'RiskZone',
      ipAddress: req.ip,
    });

    const users = await User.find({ role: 'user', isActive: true }).select('_id');
    for (const user of users) {
      await notificationService.createNotification({
        user: user._id,
        type: 'risk_zone_deleted',
        title: `Risk Zone Removed: ${oldZone.zoneName}`,
        message: `The risk zone "${oldZone.zoneName}" in ${oldZone.district || 'the area'} has been removed.`,
        link: '/dashboard/map',
        relatedId: oldZone._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Risk zone deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRiskZone,
  getRiskZones,
  getRiskZoneById,
  updateRiskZone,
  deleteRiskZone,
};
