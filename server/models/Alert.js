const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority level is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Emergency'],
        message: 'Priority must be Low, Medium, High, or Emergency',
      },
      default: 'Medium',
    },
    affectedDistricts: {
      type: [String],
      required: [true, 'At least one affected district is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one district must be specified',
      },
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Expiration date must be in the future',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Alert creator is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

alertSchema.index({ isActive: 1, priority: -1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
alertSchema.index({ affectedDistricts: 1 });

alertSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

alertSchema.set('toJSON', { virtuals: true });
alertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Alert', alertSchema);
