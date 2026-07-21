const DisasterType = require('../models/DisasterType');
const ApiError = require('../utils/ApiError');

const DEFAULT_DISASTER_TYPES = [
  { name: 'Flood', isDefault: true, color: '#2563eb', icon: 'droplets', priority: 9, displayOrder: 1 },
  { name: 'Flash Flood', isDefault: true, color: '#3b82f6', icon: 'cloud-rain', priority: 10, displayOrder: 2 },
  { name: 'Cyclone', isDefault: true, color: '#7c3aed', icon: 'wind', priority: 10, displayOrder: 3 },
  { name: 'Storm Surge', isDefault: true, color: '#6366f1', icon: 'waves', priority: 9, displayOrder: 4 },
  { name: 'Coastal Erosion', isDefault: true, color: '#d97706', icon: 'mountain', priority: 7, displayOrder: 5 },
  { name: 'Landslide', isDefault: true, color: '#92400e', icon: 'mountain-snow', priority: 8, displayOrder: 6 },
  { name: 'Earthquake', isDefault: true, color: '#6b7280', icon: 'activity', priority: 10, displayOrder: 7 },
  { name: 'Fire Accident', isDefault: true, color: '#dc2626', icon: 'flame', priority: 8, displayOrder: 8 },
  { name: 'Building Collapse', isDefault: true, color: '#b91c1c', icon: 'building', priority: 9, displayOrder: 9 },
  { name: 'Road Accident', isDefault: true, color: '#ea580c', icon: 'car', priority: 6, displayOrder: 10 },
  { name: 'Tree Fall', isDefault: true, color: '#16a34a', icon: 'trees', priority: 4, displayOrder: 11 },
  { name: 'Heavy Rain', isDefault: true, color: '#0284c7', icon: 'cloud-rain-heavy', priority: 5, displayOrder: 12 },
  { name: 'Heat Wave', isDefault: true, color: '#e11d48', icon: 'thermometer', priority: 4, displayOrder: 13 },
  { name: 'Water Logging', isDefault: true, color: '#0891b2', icon: 'droplet', priority: 5, displayOrder: 14 },
  { name: 'Medical Emergency', isDefault: true, color: '#e11d48', icon: 'heart-pulse', priority: 8, displayOrder: 15 },
  { name: 'Chemical Leak', isDefault: true, color: '#7c3aed', icon: 'flask-round', priority: 9, displayOrder: 16 },
  { name: 'Other', isDefault: true, color: '#6b7280', icon: 'alert-triangle', priority: 1, displayOrder: 17 },
];

const seedDefaults = async () => {
  const count = await DisasterType.countDocuments();
  if (count === 0) {
    await DisasterType.insertMany(
      DEFAULT_DISASTER_TYPES.map((d) => ({ ...d, isActive: true }))
    );
    console.log(`✓ Seeded ${DEFAULT_DISASTER_TYPES.length} default disaster types`);
  }
};

const getDisasterTypes = async (includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true };
  return DisasterType.find(filter).sort({ displayOrder: 1, name: 1 });
};

const getDisasterTypeById = async (id) => {
  const dt = await DisasterType.findById(id);
  if (!dt) throw new ApiError(404, 'Disaster type not found.');
  return dt;
};

const createDisasterType = async (data) => {
  const existing = await DisasterType.findOne({ name: data.name });
  if (existing) throw new ApiError(400, 'A disaster type with this name already exists.');
  return DisasterType.create(data);
};

const updateDisasterType = async (id, data) => {
  if (data.name) {
    const existing = await DisasterType.findOne({ name: data.name, _id: { $ne: id } });
    if (existing) throw new ApiError(400, 'A disaster type with this name already exists.');
  }
  const dt = await DisasterType.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!dt) throw new ApiError(404, 'Disaster type not found.');
  return dt;
};

const deleteDisasterType = async (id) => {
  const dt = await DisasterType.findById(id);
  if (!dt) throw new ApiError(404, 'Disaster type not found.');
  if (dt.isDefault) throw new ApiError(400, 'Cannot delete a default disaster type.');
  await DisasterType.findByIdAndDelete(id);
  return dt;
};

const toggleActive = async (id) => {
  const dt = await DisasterType.findById(id);
  if (!dt) throw new ApiError(404, 'Disaster type not found.');
  dt.isActive = !dt.isActive;
  await dt.save();
  return dt;
};

const getAllDisasterTypes = async () => {
  return DisasterType.find().sort({ displayOrder: 1, name: 1 });
};

module.exports = {
  seedDefaults,
  getDisasterTypes,
  getAllDisasterTypes,
  getDisasterTypeById,
  createDisasterType,
  updateDisasterType,
  deleteDisasterType,
  toggleActive,
};
