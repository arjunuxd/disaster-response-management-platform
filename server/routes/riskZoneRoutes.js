const express = require('express');
const router = express.Router();
const {
  createRiskZone,
  getRiskZones,
  getRiskZoneById,
  updateRiskZone,
  deleteRiskZone,
} = require('../controllers/riskZoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorize('admin'), createRiskZone)
  .get(getRiskZones);

router
  .route('/:id')
  .get(getRiskZoneById)
  .put(protect, authorize('admin'), updateRiskZone)
  .delete(protect, authorize('admin'), deleteRiskZone);

module.exports = router;
