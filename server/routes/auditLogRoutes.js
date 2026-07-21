const express = require('express');
const router = express.Router();
const {
  getLogs,
  getLogById,
  getRecentLogs,
  getModuleStats,
  getActionStats,
} = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/recent', getRecentLogs);
router.get('/stats/modules', getModuleStats);
router.get('/stats/actions', getActionStats);
router.get('/', getLogs);
router.get('/:id', getLogById);

module.exports = router;
