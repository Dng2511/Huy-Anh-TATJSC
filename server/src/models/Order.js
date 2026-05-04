import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    address: { type: String, required: true },
    cargoType: { type: String, required: true },
    dimension: { type: String, required: true },
    weight: { type: String, required: true },
    status: { type: String, required: true },
    eta: { type: String, required: true },
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)
