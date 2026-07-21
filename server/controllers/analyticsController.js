const analyticsService = require('../services/analyticsService');

const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportsByMonth = async (req, res, next) => {
  try {
    const data = await analyticsService.getReportsByMonth(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportsByDistrict = async (req, res, next) => {
  try {
    const data = await analyticsService.getReportsByDistrict(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportsByType = async (req, res, next) => {
  try {
    const data = await analyticsService.getReportsByType(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportsBySeverity = async (req, res, next) => {
  try {
    const data = await analyticsService.getReportsBySeverity(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportsByStatus = async (req, res, next) => {
  try {
    const data = await analyticsService.getReportsByStatus(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getAlertsByPriority = async (req, res, next) => {
  try {
    const data = await analyticsService.getAlertsByPriority(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getRiskZonesByLevel = async (req, res, next) => {
  try {
    const data = await analyticsService.getRiskZonesByLevel();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSheltersByStatus = async (req, res, next) => {
  try {
    const data = await analyticsService.getSheltersByStatus();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const data = await analyticsService.getRecentActivity();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getExportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    const validTypes = ['reports', 'alerts', 'risk-zones', 'users'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid export type.' });
    }
    const data = await analyticsService.getExportData(type, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
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
