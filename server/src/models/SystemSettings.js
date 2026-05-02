import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  hospitalName: { type: String, default: 'LabOS Demonstration Hospital', trim: true },
  facilityCode: { type: String, default: '', trim: true },
  county: { type: String, default: '', trim: true },
  subCounty: { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', lowercase: true, trim: true },
  contactPhone: { type: String, default: '', trim: true },
  logoUrl: { type: String, default: '', trim: true },
  lowStockAlertMode: { type: String, enum: ['threshold', 'threshold_or_zero'], default: 'threshold' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('SystemSettings', systemSettingsSchema);
