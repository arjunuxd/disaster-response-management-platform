const EmergencyShelter = require('../models/EmergencyShelter');
const ApiError = require('../utils/ApiError');

const createShelter = async (shelterData) => {
  const shelter = await EmergencyShelter.create(shelterData);
  return shelter;
};

const getShelters = async () => {
  const shelters = await EmergencyShelter.find().sort('-createdAt');
  return shelters;
};

const getShelterById = async (shelterId) => {
  const shelter = await EmergencyShelter.findById(shelterId);

  if (!shelter) {
    throw new ApiError(404, 'Emergency shelter not found.');
  }

  return shelter;
};

const updateShelter = async (shelterId, updateData) => {
  const shelter = await EmergencyShelter.findByIdAndUpdate(shelterId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!shelter) {
    throw new ApiError(404, 'Emergency shelter not found.');
  }

  return shelter;
};

const deleteShelter = async (shelterId) => {
  const shelter = await EmergencyShelter.findByIdAndDelete(shelterId);

  if (!shelter) {
    throw new ApiError(404, 'Emergency shelter not found.');
  }

  return shelter;
};

module.exports = {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
};
