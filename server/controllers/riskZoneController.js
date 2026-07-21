const riskZoneService = require('../services/riskZoneService');
const auditLogService = require('../services/auditLogService');

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
