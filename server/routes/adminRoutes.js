const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router
  .route('/users')
  .get(getUsers);

router
  .route('/users/:id')
  .get(getUserById)
  .delete(deleteUser);

router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
