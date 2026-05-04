import mongoose from 'mongoose'

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    license: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true },
    schedule: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
)

export const Driver = mongoose.model('Driver', driverSchema)
