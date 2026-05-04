import mongoose from 'mongoose'

const metricSchema = new mongoose.Schema(
  {
    totalOrdersToday: { type: Number, required: true },
    activeVehicles: { type: Number, required: true },
    deliveringOrders: { type: Number, required: true },
    revenueToday: { type: Number, required: true },
    activeTrips: { type: Number, required: true },
    avgDriverPerformance: { type: Number, required: true },
    operationCostRate: { type: Number, required: true },
  },
  { timestamps: true }
)

export const Metric = mongoose.model('Metric', metricSchema)
