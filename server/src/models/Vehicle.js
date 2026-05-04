import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    capacity: { type: String, required: true },
    status: { type: String, required: true },
    fuel: { type: Number, required: true },
    route: { type: String, required: true },
  },
  { timestamps: true }
)

export const Vehicle = mongoose.model('Vehicle', vehicleSchema)
