const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
      description: 'OUT: Hải Phòng → A, IN: B → Hải Phòng',
    },
    location: {
      type: String,
      enum: ['A', 'B'],
      required: true,
      description: 'Destination location',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'done'],
      default: 'pending',
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

module.exports = mongoose.model('Order', orderSchema);
