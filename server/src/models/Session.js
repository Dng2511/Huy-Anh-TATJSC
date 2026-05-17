const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  userAgent: { type: String },
  ip: { type: String },
  revoked: { type: Boolean, default: false },
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
