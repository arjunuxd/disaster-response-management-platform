const adminService = require('../services/adminService');
const auditLogService = require('../services/auditLogService');

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const oldUser = await adminService.getUserById(req.params.id);
    const oldData = {
      isActive: oldUser.isActive,
      fullName: oldUser.fullName,
      email: oldUser.email,
      role: oldUser.role,
    };

    const user = await adminService.toggleUserStatus(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: user.isActive ? 'User Activated' : 'User Deactivated',
      module: 'User',
      oldValue: oldData,
      newValue: { ...oldData, isActive: user.isActive },
      affectedRecordId: user._id,
      affectedRecordModel: 'User',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin).',
      });
    }

    const oldUser = await adminService.getUserById(req.params.id);
    const oldData = {
      role: oldUser.role,
      fullName: oldUser.fullName,
      email: oldUser.email,
    };

    const user = await adminService.updateUserRole(req.params.id, role);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Role Changed',
      module: 'User',
      oldValue: oldData,
      newValue: { ...oldData, role: user.role },
      affectedRecordId: user._id,
      affectedRecordModel: 'User',
      ipAddress: req.ip,
      remarks: `Role changed from ${oldData.role} to ${user.role}`,
    });

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const oldUser = await adminService.getUserById(req.params.id);
    const oldData = {
      fullName: oldUser.fullName,
      email: oldUser.email,
      role: oldUser.role,
    };

    await adminService.deleteUser(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'User Deleted',
      module: 'User',
      oldValue: oldData,
      affectedRecordId: oldUser._id,
      affectedRecordModel: 'User',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getDashboardStats,
};
