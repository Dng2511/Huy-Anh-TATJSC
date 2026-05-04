import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    customer: { type: String, required: true },
    amount: { type: Number, required: true },
    payment: { type: String, required: true },
    channel: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

export const Invoice = mongoose.model('Invoice', invoiceSchema)
