import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema(
  {
    warehouse: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    product: { type: String, required: true },
    inbound: { type: Number, required: true },
    outbound: { type: Number, required: true },
    stock: { type: Number, required: true },
    position: { type: String, required: true },
  },
  { timestamps: true }
)

export const Inventory = mongoose.model('Inventory', inventorySchema)
