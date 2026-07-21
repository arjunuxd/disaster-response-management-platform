const AuditLog = require('../models/AuditLog');

const log = async ({
  adminId,
  adminName,
  action,
  module,
  oldValue = null,
  newValue = null,
  affectedRecordId = null,
  affectedRecordModel = null,
  ipAddress = '127.0.0.1',
  status = 'Success',
  remarks = '',
}) => {
  try {
    await AuditLog.create({
      adminId,
      adminName,
      action,
      module,
      oldValue,
      newValue,
      affectedRecordId,
      affectedRecordModel,
      ipAddress,
      status,
      remarks,
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

const getLogs = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    query.$or = [
      { adminName: regex },
      { action: regex },
      { remarks: regex },
    ];
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.module) {
    query.module = filters.module;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.adminId) {
    query.adminId = filters.adminId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('adminId', 'fullName email')
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit,
    },
  };
};

const getLogById = async (id) => {
  return AuditLog.findById(id)
    .populate('adminId', 'fullName email')
    .lean();
};

const getRecentLogs = async (limit = 10) => {
  return AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'fullName email')
    .lean();
};

const getModuleStats = async () => {
  return AuditLog.aggregate([
    { $group: { _id: '$module', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const getActionStats = async () => {
  return AuditLog.aggregate([
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
};

module.exports = {
  log,
  getLogs,
  getLogById,
  getRecentLogs,
  getModuleStats,
  getActionStats,
};
