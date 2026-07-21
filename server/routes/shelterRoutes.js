const express = require('express');
const router = express.Router();
const {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
} = require('../controllers/shelterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorize('admin'), createShelter)
  .get(getShelters);

router
  .route('/:id')
  .get(getShelterById)
  .put(protect, authorize('admin'), updateShelter)
  .delete(protect, authorize('admin'), deleteShelter);

module.exports = router;
