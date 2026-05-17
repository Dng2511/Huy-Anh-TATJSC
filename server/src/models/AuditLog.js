const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    resource: { type: String, default: '' },
    resourceId: { type: String, default: '' },
    action: { type: String, required: true },
    statusCode: { type: Number, required: true },
    requestBody: { type: mongoose.Schema.Types.Mixed, default: null },
    params: { type: mongoose.Schema.Types.Mixed, default: null },
    query: { type: mongoose.Schema.Types.Mixed, default: null },
    responseBody: { type: mongoose.Schema.Types.Mixed, default: null },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
