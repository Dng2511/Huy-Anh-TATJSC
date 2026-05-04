import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema(
  {
    route: { type: String, required: true },
    vehicle: { type: String, required: true },
    driver: { type: String, required: true },
    orders: [{ type: String, required: true }],
    optimize: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
)

export const Trip = mongoose.model('Trip', tripSchema)
