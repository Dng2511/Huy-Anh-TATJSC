import mongoose from 'mongoose'

const costRowSchema = new mongoose.Schema(
  {
    trip: { type: String, required: true },
    fuel: { type: Number, required: true },
    toll: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    driverCost: { type: Number, required: true },
  },
  { timestamps: true }
)

export const CostRow = mongoose.model('CostRow', costRowSchema)
