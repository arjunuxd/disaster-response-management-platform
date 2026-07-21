const mongoose = require('mongoose');

const riskZoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
      minlength: [2, 'Zone name must be at least 2 characters'],
      maxlength: [150, 'Zone name cannot exceed 150 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    riskLevel: {
      type: String,
      required: [true, 'Risk level is required'],
      enum: {
        values: ['Low', 'Moderate', 'High', 'Critical'],
        message: 'Risk level must be Low, Moderate, High, or Critical',
      },
      default: 'Moderate',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

riskZoneSchema.index({ latitude: 1, longitude: 1 });
riskZoneSchema.index({ district: 1, state: 1 });
riskZoneSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('RiskZone', riskZoneSchema);
