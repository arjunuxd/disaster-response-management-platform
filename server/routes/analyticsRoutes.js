const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public endpoint — no auth required
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');
const EmergencyShelter = require('../models/EmergencyShelter');

router.get('/public-overview', async (req, res, next) => {
  try {
    const [totalReports, activeAlerts, riskZoneCount, shelterCount] = await Promise.all([
      Report.countDocuments(),
      Alert.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
      RiskZone.countDocuments(),
      EmergencyShelter.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      data: { totalReports, activeAlerts, riskZoneCount, shelterCount },
    });
  } catch (error) {
    next(error);
  }
});

// Admin-only endpoints
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/reports-by-month', getReportsByMonth);
router.get('/reports-by-district', getReportsByDistrict);
router.get('/reports-by-type', getReportsByType);
router.get('/reports-by-severity', getReportsBySeverity);
router.get('/reports-by-status', getReportsByStatus);
router.get('/alerts-by-priority', getAlertsByPriority);
router.get('/risk-zones-by-level', getRiskZonesByLevel);
router.get('/shelters-by-status', getSheltersByStatus);
router.get('/recent-activity', getRecentActivity);
router.get('/export/:type', getExportData);

module.exports = router;
