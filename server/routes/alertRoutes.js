const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorize('admin'), createAlert)
  .get(getAlerts);

router
  .route('/:id')
  .get(getAlertById)
  .put(protect, authorize('admin'), updateAlert)
  .delete(protect, authorize('admin'), deleteAlert);

module.exports = router;
