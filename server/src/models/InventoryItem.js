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
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  deactivatedAt: Date,
  deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

inventoryItemSchema.virtual('isLowStock').get(function lowStock() {
  return this.quantity <= this.minThreshold;
});

inventoryItemSchema.virtual('isExpired').get(function expired() {
  return this.expiryDate && this.expiryDate < new Date();
});

inventoryItemSchema.virtual('isOutOfStock').get(function outOfStock() {
  return this.quantity === 0;
});

inventoryItemSchema.virtual('stockStatus').get(function stockStatus() {
  if (this.status === 'inactive') return 'inactive';
  if (this.quantity === 0) return 'out_of_stock';
  if (this.expiryDate && this.expiryDate < new Date()) return 'expired';
  if (this.quantity <= this.minThreshold) return 'low_stock';
  return 'available';
});

inventoryItemSchema.set('toJSON', { virtuals: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
