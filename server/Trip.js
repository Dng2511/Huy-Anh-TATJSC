const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle',
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Driver',
    },
    order1Id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    order2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    route: {
      stopA: {
        type: String,
        required: true,
      },
      stopB: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ['planned', 'running', 'completed'],
      default: 'planned',
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
