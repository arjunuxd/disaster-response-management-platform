const User = require('../models/User');
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');
const EmergencyShelter = require('../models/EmergencyShelter');

const buildDateFilter = (query) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return filter;
};

const buildReportMatch = (query) => {
  const match = buildDateFilter(query);
  if (query.state) match.state = query.state;
  if (query.district) match.district = query.district;
  if (query.reportType) match.reportType = query.reportType;
  if (query.severity) match.severity = query.severity;
  if (query.status) match.status = query.status;
  return match;
};

const getOverview = async (query = {}) => {
  const reportMatch = buildReportMatch(query);
  const dateMatch = buildDateFilter(query);

  const [
    totalUsers,
    activeUsers,
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
    Report.countDocuments(reportMatch),
    Report.countDocuments({ ...reportMatch, status: 'Pending' }),
    Report.countDocuments({ ...reportMatch, status: 'Verified' }),
    Report.countDocuments({ ...reportMatch, status: 'Resolved' }),
    Report.countDocuments({ ...reportMatch, status: 'Rejected' }),
    Alert.countDocuments({ ...dateMatch, isActive: true, expiresAt: { $gt: new Date() } }),
    Alert.countDocuments(dateMatch),
    RiskZone.countDocuments(dateMatch),
    EmergencyShelter.countDocuments(),
    EmergencyShelter.countDocuments({ status: 'Open' }),
    Report.aggregate([
      { $match: reportMatch },
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
    inactiveUsers: totalUsers - activeUsers,
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
    closedShelters: shelterCount - openShelters,
    reportsByType: typeCounts,
  };
};

const getReportsByMonth = async (query = {}) => {
  const match = buildReportMatch(query);

  const results = await Report.aggregate([
    { $match: match },
    { $lookup: { from: 'disastertypes', localField: 'reportType', foreignField: '_id', as: 'dt' } },
    { $unwind: { path: '$dt', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        byType: { $push: '$dt.name' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return results.map((r) => {
    const typeCounts = {};
    r.byType.forEach((t) => { typeCounts[t] = (typeCounts[t] || 0) + 1; });
    return {
      label: `${monthNames[r._id.month - 1]} ${r._id.year}`,
      total: r.count,
      byType: typeCounts,
    };
  });
};

const getReportsByDistrict = async (query = {}) => {
  const match = buildReportMatch(query);

  const results = await Report.aggregate([
    { $match: match },
    { $group: { _id: '$district', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  return results.map((r) => ({ label: r._id, count: r.count }));
};

const getReportsByType = async (query = {}) => {
  const match = buildReportMatch(query);

  const results = await Report.aggregate([
    { $match: match },
    { $lookup: { from: 'disastertypes', localField: 'reportType', foreignField: '_id', as: 'dt' } },
    { $unwind: { path: '$dt', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$dt.name', count: { $sum: 1 } } },
  ]);

  return results.map((r) => ({ label: r._id, count: r.count }));
};

const getReportsBySeverity = async (query = {}) => {
  const match = buildReportMatch(query);

  const results = await Report.aggregate([
    { $match: match },
    { $group: { _id: '$severity', count: { $sum: 1 } } },
  ]);

  const order = ['Low', 'Medium', 'High', 'Critical'];
  const sorted = results.sort(
    (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
  );
  return sorted.map((r) => ({ label: r._id, count: r.count }));
};

const getReportsByStatus = async (query = {}) => {
  const match = buildReportMatch(query);

  const results = await Report.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const order = ['Pending', 'Under Review', 'Assigned', 'Verified', 'Rejected', 'Resolved', 'Closed'];
  const sorted = results.sort(
    (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
  );
  return sorted.map((r) => ({ label: r._id, count: r.count }));
};

const getAlertsByPriority = async (query = {}) => {
  const dateMatch = buildDateFilter(query);

  const results = await Alert.aggregate([
    { $match: dateMatch },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const order = ['Low', 'Medium', 'High', 'Emergency'];
  const sorted = results.sort(
    (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
  );
  return sorted.map((r) => ({ label: r._id, count: r.count }));
};

const getRiskZonesByLevel = async () => {
  const results = await RiskZone.aggregate([
    { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
  ]);

  const order = ['Low', 'Moderate', 'High', 'Critical'];
  const sorted = results.sort(
    (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
  );
  return sorted.map((r) => ({ label: r._id, count: r.count }));
};

const getSheltersByStatus = async () => {
  const results = await EmergencyShelter.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return results.map((r) => ({ label: r._id, count: r.count }));
};

const getRecentActivity = async () => {
  const [recentReports, recentAlerts, recentZones, recentUsers] =
    await Promise.all([
      Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title reportType severity status district createdAt')
        .populate('reportType', 'name')
        .lean(),
      Alert.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title priority isActive affectedDistricts createdAt')
        .lean(),
      RiskZone.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('zoneName riskLevel district createdAt')
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email role isActive createdAt')
        .lean(),
    ]);

  return {
    recentReports,
    recentAlerts,
    recentZones,
    recentUsers,
  };
};

const getExportData = async (type, query = {}) => {
  const reportMatch = buildReportMatch(query);
  const dateMatch = buildDateFilter(query);

  switch (type) {
    case 'reports': {
      const reports = await Report.find(reportMatch)
        .sort({ createdAt: -1 })
        .select('title reportType severity status district state address latitude longitude createdAt')
        .populate('reportedBy', 'fullName email')
        .populate('reportType', 'name')
        .lean();
      return reports.map((r) => ({
        Title: r.title,
        Type: r.reportType?.name || 'Unknown',
        Severity: r.severity,
        Status: r.status,
        District: r.district,
        State: r.state,
        Address: r.address || '',
        Latitude: r.latitude,
        Longitude: r.longitude,
        'Reported By': r.reportedBy?.fullName || 'Unknown',
        Date: new Date(r.createdAt).toLocaleDateString('en-IN'),
      }));
    }
    case 'alerts': {
      const alerts = await Alert.find(dateMatch)
        .sort({ createdAt: -1 })
        .select('title priority isActive affectedDistricts expiresAt createdAt')
        .populate('createdBy', 'fullName')
        .lean();
      return alerts.map((a) => ({
        Title: a.title,
        Priority: a.priority,
        Active: a.isActive ? 'Yes' : 'No',
        Districts: a.affectedDistricts?.join(', ') || '',
        'Expires At': new Date(a.expiresAt).toLocaleDateString('en-IN'),
        'Created By': a.createdBy?.fullName || 'Unknown',
        Date: new Date(a.createdAt).toLocaleDateString('en-IN'),
      }));
    }
    case 'risk-zones': {
      const zones = await RiskZone.find(dateMatch)
        .sort({ createdAt: -1 })
        .select('zoneName riskLevel district state latitude longitude description createdAt')
        .populate('createdBy', 'fullName')
        .lean();
      return zones.map((z) => ({
        'Zone Name': z.zoneName,
        'Risk Level': z.riskLevel,
        District: z.district,
        State: z.state,
        Latitude: z.latitude,
        Longitude: z.longitude,
        Description: z.description || '',
        'Created By': z.createdBy?.fullName || 'Unknown',
        Date: new Date(z.createdAt).toLocaleDateString('en-IN'),
      }));
    }
    case 'users': {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .select('fullName email role phone isActive createdAt')
        .lean();
      return users.map((u) => ({
        Name: u.fullName,
        Email: u.email,
        Role: u.role,
        Phone: u.phone || '',
        Active: u.isActive ? 'Yes' : 'No',
        'Joined': new Date(u.createdAt).toLocaleDateString('en-IN'),
      }));
    }
    default:
      return [];
  }
};

module.exports = {
  getOverview,
  getReportsByMonth,
  getReportsByDistrict,
  getReportsByType,
  getReportsBySeverity,
  getReportsByStatus,
  getAlertsByPriority,
  getRiskZonesByLevel,
  getSheltersByStatus,
  getRecentActivity,
  getExportData,
};
