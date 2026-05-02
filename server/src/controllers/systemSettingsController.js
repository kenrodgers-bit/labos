import SystemSettings from '../models/SystemSettings.js';
import { writeAudit } from '../utils/audit.js';

async function getOrCreateSettings() {
  const existing = await SystemSettings.findOne().populate('updatedBy');
  if (existing) return existing;
  return SystemSettings.create({});
}

export async function getSystemSettings(req, res) {
  res.json(await getOrCreateSettings());
}

export async function updateSystemSettings(req, res) {
  const settings = await getOrCreateSettings();
  const before = settings.toObject();
  const allowed = ['hospitalName', 'facilityCode', 'county', 'subCounty', 'contactEmail', 'contactPhone', 'logoUrl', 'lowStockAlertMode'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  }
  settings.updatedBy = req.user._id;
  await settings.save();
  await writeAudit({ action: 'system_settings.updated', performedBy: req.user._id, before, after: settings, req });
  res.json(await SystemSettings.findById(settings._id).populate('updatedBy'));
}
