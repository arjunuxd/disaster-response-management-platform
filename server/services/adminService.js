const User = require('../models/User');
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');
const EmergencyShelter = require('../models/EmergencyShelter');
const ApiError = require('../utils/ApiError');

const getUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search,
    role,
    isActive,
  } = queryParams;

  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { fullName: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user;
};

const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

const updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  user.role = role;
  await user.save();

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user;
};

const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    rejectedReports,
    activeAlerts,
    totalAlerts,
    riskZoneCount,
    shelterCount,
    openShelters,
    reportsByType,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    Report.countDocuments(),
    Report.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'Verified' }),
    Report.countDocuments({ status: 'Resolved' }),
    Report.countDocuments({ status: 'Rejected' }),
    Alert.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
    Alert.countDocuments(),
    RiskZone.countDocuments(),
    EmergencyShelter.countDocuments(),
    EmergencyShelter.countDocuments({ status: 'Open' }),
    Report.aggregate([
      { $lookup: { from: 'disastertypes', localField: 'reportType', foreignField: '_id', as: 'dt' } },
      { $unwind: { path: '$dt', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dt.name', count: { $sum: 1 } } },
    ]),
  ]);

  const typeCounts = {};
  reportsByType.forEach((t) => { typeCounts[t._id] = t.count; });

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    rejectedReports,
    activeAlerts,
    totalAlerts,
    riskZoneCount,
    shelterCount,
    openShelters,
    reportsByType: typeCounts,
  };
};

module.exports = {
  getUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getDashboardStats,
};
