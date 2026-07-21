const disasterTypeService = require('../services/disasterTypeService');
const auditLogService = require('../services/auditLogService');

const getDisasterTypes = async (req, res, next) => {
  try {
    const types = await disasterTypeService.getDisasterTypes();
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (error) {
    next(error);
  }
};

const getAllDisasterTypes = async (req, res, next) => {
  try {
    const types = await disasterTypeService.getAllDisasterTypes();
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (error) {
    next(error);
  }
};

const getDisasterTypeById = async (req, res, next) => {
  try {
    const type = await disasterTypeService.getDisasterTypeById(req.params.id);
    res.status(200).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
};

const createDisasterType = async (req, res, next) => {
  try {
    const type = await disasterTypeService.createDisasterType(req.body);
    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Disaster Type Created',
      module: 'DisasterType',
      newValue: type.toObject(),
      affectedRecordId: type._id,
      affectedRecordModel: 'DisasterType',
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, message: 'Disaster type created successfully.', data: type });
  } catch (error) {
    next(error);
  }
};

const updateDisasterType = async (req, res, next) => {
  try {
    const oldType = await disasterTypeService.getDisasterTypeById(req.params.id);
    const oldData = oldType.toObject();
    const type = await disasterTypeService.updateDisasterType(req.params.id, req.body);
    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Disaster Type Updated',
      module: 'DisasterType',
      oldValue: oldData,
      newValue: type.toObject(),
      affectedRecordId: type._id,
      affectedRecordModel: 'DisasterType',
      ipAddress: req.ip,
    });
    res.status(200).json({ success: true, message: 'Disaster type updated successfully.', data: type });
  } catch (error) {
    next(error);
  }
};

const deleteDisasterType = async (req, res, next) => {
  try {
    const oldType = await disasterTypeService.getDisasterTypeById(req.params.id);
    const oldData = oldType.toObject();
    await disasterTypeService.deleteDisasterType(req.params.id);
    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Disaster Type Deleted',
      module: 'DisasterType',
      oldValue: oldData,
      affectedRecordId: oldType._id,
      affectedRecordModel: 'DisasterType',
      ipAddress: req.ip,
    });
    res.status(200).json({ success: true, message: 'Disaster type deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const toggleDisasterTypeActive = async (req, res, next) => {
  try {
    const oldType = await disasterTypeService.getDisasterTypeById(req.params.id);
    const oldData = oldType.toObject();
    const type = await disasterTypeService.toggleActive(req.params.id);
    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: type.isActive ? 'Disaster Type Enabled' : 'Disaster Type Disabled',
      module: 'DisasterType',
      oldValue: { isActive: oldData.isActive },
      newValue: { isActive: type.isActive },
      affectedRecordId: type._id,
      affectedRecordModel: 'DisasterType',
      ipAddress: req.ip,
    });
    res.status(200).json({
      success: true,
      message: `Disaster type ${type.isActive ? 'enabled' : 'disabled'} successfully.`,
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDisasterTypes,
  getAllDisasterTypes,
  getDisasterTypeById,
  createDisasterType,
  updateDisasterType,
  deleteDisasterType,
  toggleDisasterTypeActive,
};
