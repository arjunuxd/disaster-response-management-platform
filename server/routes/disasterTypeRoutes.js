const express = require('express');
const router = express.Router();
const {
  getDisasterTypes,
  getAllDisasterTypes,
  getDisasterTypeById,
  createDisasterType,
  updateDisasterType,
  deleteDisasterType,
  toggleDisasterTypeActive,
} = require('../controllers/disasterTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDisasterTypes);
router.get('/all', protect, authorize('admin'), getAllDisasterTypes);
router.get('/:id', getDisasterTypeById);
router.post('/', protect, authorize('admin'), createDisasterType);
router.put('/:id', protect, authorize('admin'), updateDisasterType);
router.patch('/:id/toggle-active', protect, authorize('admin'), toggleDisasterTypeActive);
router.delete('/:id', protect, authorize('admin'), deleteDisasterType);

module.exports = router;
