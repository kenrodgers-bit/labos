import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  requestedQuantity: { type: Number, required: true, min: 1 },
  approvedQuantity: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'partially_approved'], default: 'pending' },
  urgency: { type: String, enum: ['routine', 'urgent', 'critical'], default: 'routine' },
  notes: String,
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adjustmentReason: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
