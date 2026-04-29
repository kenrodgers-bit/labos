import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true }
});

export default mongoose.model('AuditLog', auditLogSchema);
