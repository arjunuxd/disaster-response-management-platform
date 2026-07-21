const auditLogService = require('../services/auditLogService');

const getLogs = async (req, res, next) => {
  try {
    const result = await auditLogService.getLogs(req.query);
    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getLogById = async (req, res, next) => {
  try {
    const log = await auditLogService.getLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found.' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const getRecentLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const logs = await auditLogService.getRecentLogs(limit);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const getModuleStats = async (req, res, next) => {
  try {
    const stats = await auditLogService.getModuleStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getActionStats = async (req, res, next) => {
  try {
    const stats = await auditLogService.getActionStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogs,
  getLogById,
  getRecentLogs,
  getModuleStats,
  getActionStats,
};
