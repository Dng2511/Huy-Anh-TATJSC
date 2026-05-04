import mongoose from 'mongoose'

const trackingVehicleSchema = new mongoose.Schema(
  {
    vehicle: { type: String, required: true },
    location: { type: String, required: true },
    eta: { type: String, required: true },
    shipment: { type: String, required: true },
    status: { type: String, required: true },
    history: { type: String, required: true },
  },
  { timestamps: true }
)

export const TrackingVehicle = mongoose.model('TrackingVehicle', trackingVehicleSchema)
