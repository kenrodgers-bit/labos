import mongoose from 'mongoose';

const reportEntrySchema = new mongoose.Schema({
  categoryKey: { type: String, required: true },
  testKey: { type: String, required: true },
  testName: { type: String, required: true },
  group: { type: String, default: '' },
  values: { type: Map, of: Number, default: {} }
}, { _id: false });

const labReportSchema = new mongoose.Schema({
  periodMonth: { type: String, required: true, index: true },
  facility: {
    mflCode: { type: String, default: '', trim: true },
    facilityName: { type: String, default: '', trim: true },
    county: { type: String, default: '', trim: true },
    subCounty: { type: String, default: '', trim: true }
  },
  entries: [reportEntrySchema],
  totals: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft', index: true },
  compiledBy: { type: String, default: '', trim: true },
  designation: { type: String, default: '', trim: true },
  signature: { type: String, default: '', trim: true },
  submittedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastSavedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

labReportSchema.index({ periodMonth: 1, 'facility.mflCode': 1, updatedAt: -1 });
labReportSchema.set('toJSON', { flattenMaps: true, virtuals: true });
labReportSchema.set('toObject', { flattenMaps: true, virtuals: true });

export default mongoose.model('LabReport', labReportSchema);
