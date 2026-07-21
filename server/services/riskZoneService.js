const RiskZone = require('../models/RiskZone');
const ApiError = require('../utils/ApiError');

const createRiskZone = async (zoneData) => {
  const zone = await RiskZone.create(zoneData);
  return zone.populate('createdBy', 'fullName email');
};

const getRiskZones = async () => {
  const zones = await RiskZone.find()
    .populate('createdBy', 'fullName email')
    .sort('-createdAt');
  return zones;
};

const getRiskZoneById = async (zoneId) => {
  const zone = await RiskZone.findById(zoneId)
    .populate('createdBy', 'fullName email');

  if (!zone) {
    throw new ApiError(404, 'Risk zone not found.');
  }

  return zone;
};

const updateRiskZone = async (zoneId, updateData) => {
  const zone = await RiskZone.findByIdAndUpdate(zoneId, updateData, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'fullName email');

  if (!zone) {
    throw new ApiError(404, 'Risk zone not found.');
  }

  return zone;
};

const deleteRiskZone = async (zoneId) => {
  const zone = await RiskZone.findByIdAndDelete(zoneId);

  if (!zone) {
    throw new ApiError(404, 'Risk zone not found.');
  }

  return zone;
};

module.exports = {
  createRiskZone,
  getRiskZones,
  getRiskZoneById,
  updateRiskZone,
  deleteRiskZone,
};
