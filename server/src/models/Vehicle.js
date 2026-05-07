const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    fuelRate: {
      type: Number,
      required: true,
      min: 0,
      description: 'L/100km',
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'maintenance'],
      default: 'idle',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
