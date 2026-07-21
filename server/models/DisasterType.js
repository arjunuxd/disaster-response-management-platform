const mongoose = require('mongoose');

const disasterTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Disaster type name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '#6b7280',
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex color'],
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon cannot exceed 50 characters'],
      default: 'alert-triangle',
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be between 1 and 10'],
      max: [10, 'Priority must be between 1 and 10'],
      default: 5,
    },
    displayOrder: {
      type: Number,
      required: [true, 'Display order is required'],
      min: [1, 'Display order must be at least 1'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

disasterTypeSchema.index({ isActive: 1 });
disasterTypeSchema.index({ displayOrder: 1 });
disasterTypeSchema.index({ priority: 1 });

module.exports = mongoose.model('DisasterType', disasterTypeSchema);
