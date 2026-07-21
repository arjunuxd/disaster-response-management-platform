const shelterService = require('../services/shelterService');
const auditLogService = require('../services/auditLogService');

const createShelter = async (req, res, next) => {
  try {
    const shelter = await shelterService.createShelter(req.body);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Shelter Created',
      module: 'Shelter',
      newValue: shelter.toObject(),
      affectedRecordId: shelter._id,
      affectedRecordModel: 'EmergencyShelter',
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency shelter created successfully.',
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

const getShelters = async (req, res, next) => {
  try {
    const shelters = await shelterService.getShelters();

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error) {
    next(error);
  }
};

const getShelterById = async (req, res, next) => {
  try {
    const shelter = await shelterService.getShelterById(req.params.id);

    res.status(200).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

const updateShelter = async (req, res, next) => {
  try {
    const oldShelter = await shelterService.getShelterById(req.params.id);
    const oldData = {
      shelterName: oldShelter.shelterName,
      capacity: oldShelter.capacity,
      status: oldShelter.status,
      district: oldShelter.district,
    };

    const shelter = await shelterService.updateShelter(req.params.id, req.body);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Shelter Updated',
      module: 'Shelter',
      oldValue: oldData,
      newValue: shelter.toObject(),
      affectedRecordId: shelter._id,
      affectedRecordModel: 'EmergencyShelter',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Emergency shelter updated successfully.',
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

const deleteShelter = async (req, res, next) => {
  try {
    const oldShelter = await shelterService.getShelterById(req.params.id);
    const oldData = {
      shelterName: oldShelter.shelterName,
      district: oldShelter.district,
      capacity: oldShelter.capacity,
    };

    await shelterService.deleteShelter(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Shelter Deleted',
      module: 'Shelter',
      oldValue: oldData,
      affectedRecordId: oldShelter._id,
      affectedRecordModel: 'EmergencyShelter',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Emergency shelter deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
};
