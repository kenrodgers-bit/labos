import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

export default mongoose.model('StockMovement', stockMovementSchema);
