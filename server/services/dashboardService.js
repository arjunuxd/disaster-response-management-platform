const User = require('../models/User');
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');
const EmergencyShelter = require('../models/EmergencyShelter');

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    activeAlerts,
    riskZoneCount,
    shelterCount,
    reportsByType,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Report.countDocuments(),
    Report.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'Verified' }),
    Report.countDocuments({ status: 'Resolved' }),
    Alert.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
    RiskZone.countDocuments(),
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
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    activeAlerts,
    riskZoneCount,
    shelterCount,
    reportsByType: typeCounts,
  };
};

module.exports = { getDashboardStats };
