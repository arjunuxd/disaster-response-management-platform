const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    adminName: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: [
          'Admin Login',
          'Admin Logout',
          'User Created',
          'User Deleted',
          'User Updated',
          'User Activated',
          'User Deactivated',
          'Role Changed',
          'Report Created',
          'Report Updated',
          'Report Deleted',
          'Report Approved',
          'Report Rejected',
          'Report Resolved',
          'Report Assigned',
          'Report Closed',
          'Shelter Created',
          'Shelter Updated',
          'Shelter Deleted',
          'Disaster Type Created',
          'Disaster Type Updated',
          'Disaster Type Deleted',
          'Disaster Type Enabled',
          'Disaster Type Disabled',
          'Settings Updated',
          'Alert Created',
          'Alert Updated',
          'Alert Deleted',
          'Alert Activated',
          'Alert Deactivated',
          'Risk Zone Created',
          'Risk Zone Updated',
          'Risk Zone Deleted',
        ],
        message: 'Invalid action type',
      },
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      enum: {
        values: ['Auth', 'User', 'Report', 'Alert', 'Shelter', 'RiskZone', 'DisasterType', 'Settings'],
        message: 'Invalid module',
      },
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    affectedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    affectedRecordModel: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Success', 'Failed'],
        message: 'Status must be Success or Failed',
      },
      default: 'Success',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ affectedRecordId: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
