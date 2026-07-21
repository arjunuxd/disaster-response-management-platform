const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  assignReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .post(protect, upload.array('images', 5), createReport)
  .get(getReports);

router
  .route('/:id')
  .get(getReportById)
  .put(protect, upload.array('images', 5), updateReport)
  .delete(protect, authorize('admin'), deleteReport);

router.patch('/:id/status', protect, authorize('admin'), updateReportStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignReport);

module.exports = router;
