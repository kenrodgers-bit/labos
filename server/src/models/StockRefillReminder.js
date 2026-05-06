import mongoose from 'mongoose';

const stockRefillReminderSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  note: { type: String, default: '', trim: true, maxlength: 500 },
  status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('StockRefillReminder', stockRefillReminderSchema);
// LabOS fix: Staff refill reminders create durable Admin-visible records without removing existing inventory features.
