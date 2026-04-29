import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  minThreshold: { type: Number, required: true, min: 0, default: 0 },
  expiryDate: { type: Date, required: true },
  supplier: { type: String, default: '' },
  location: { type: String, default: '' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

inventoryItemSchema.virtual('isLowStock').get(function lowStock() {
  return this.quantity <= this.minThreshold;
});

inventoryItemSchema.virtual('isExpired').get(function expired() {
  return this.expiryDate && this.expiryDate < new Date();
});

inventoryItemSchema.set('toJSON', { virtuals: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
