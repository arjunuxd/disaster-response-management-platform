const mongoose = require('mongoose');

const emergencyShelterSchema = new mongoose.Schema(
  {
    shelterName: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
      minlength: [2, 'Shelter name must be at least 2 characters'],
      maxlength: [200, 'Shelter name cannot exceed 200 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
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
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid contact number'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Open', 'Closed'],
        message: 'Status must be either Open or Closed',
      },
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

emergencyShelterSchema.index({ district: 1 });
emergencyShelterSchema.index({ latitude: 1, longitude: 1 });
emergencyShelterSchema.index({ status: 1 });
emergencyShelterSchema.index({ status: 1, district: 1 });

module.exports = mongoose.model('EmergencyShelter', emergencyShelterSchema);
