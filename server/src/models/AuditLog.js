import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  targetItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', index: true },
  targetRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' }
});

export default mongoose.model('AuditLog', auditLogSchema);
