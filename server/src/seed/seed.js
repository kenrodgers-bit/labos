import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import AuditLog from '../models/AuditLog.js';
import Department from '../models/Department.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';
import { ROLES } from '../utils/permissions.js';

dotenv.config();

const departmentNames = [
  'Haematology',
  'Microbiology',
  'Parasitology',
  'Blood Transfusion',
  'Biochemistry',
  'Serology',
  'Histology/Cytology',
  'Phlebotomy'
];

const itemSeed = [
  ['EDTA Vacutainer Tubes', 'Consumables', 'box', 42, 15, '2027-02-12', 'MedSource Kenya', 'Store A1'],
  ['Rapid Malaria Test Kits', 'Diagnostics', 'kit', 18, 25, '2026-09-30', 'Kemsa', 'Fridge 2'],
  ['Sodium Citrate Tubes', 'Consumables', 'box', 9, 12, '2027-01-18', 'Labcare Ltd', 'Store A2'],
  ['HIV Determine Kits', 'Diagnostics', 'kit', 65, 20, '2026-12-01', 'Abbott Distributor', 'Secure Cabinet'],
  ['Glucose Reagent', 'Reagents', 'bottle', 7, 10, '2026-07-11', 'Roche Kenya', 'Cold Room'],
  ['Gram Stain Crystal Violet', 'Reagents', 'bottle', 14, 8, '2027-05-09', 'BioLab Supplies', 'Micro Shelf'],
  ['Blood Grouping Anti-A', 'Reagents', 'vial', 5, 6, '2026-06-01', 'Fortress Diagnostics', 'Blood Bank Fridge'],
  ['Microscope Slides', 'Consumables', 'pack', 120, 40, '2029-01-01', 'General Medical', 'Store B4'],
  ['Urine Strips 10 Parameter', 'Diagnostics', 'tin', 22, 10, '2026-10-14', 'Human Diagnostics', 'Bench 3'],
  ['Formalin 10%', 'Chemical', 'litre', 11, 5, '2028-03-03', 'Histolab Kenya', 'Chemical Cabinet']
];

async function seed() {
  await connectDB();
  const force = process.argv.includes('--force');
  const existingRecords = await Promise.all([
    AuditLog.estimatedDocumentCount(),
    StockMovement.estimatedDocumentCount(),
    Request.estimatedDocumentCount(),
    InventoryItem.estimatedDocumentCount(),
    User.estimatedDocumentCount(),
    Department.estimatedDocumentCount()
  ]);

  if (existingRecords.some((count) => count > 0) && !force) {
    console.log('LabOS seed skipped because this database already has data. Run `npm run seed -- --force` to reset it.');
    await mongoose.disconnect();
    return;
  }

  if (force) {
    await Promise.all([AuditLog.deleteMany(), StockMovement.deleteMany(), Request.deleteMany(), InventoryItem.deleteMany(), User.deleteMany(), Department.deleteMany()]);
  }

  const departments = await Department.insertMany(departmentNames.map((name) => ({ name, description: `${name} laboratory section` })));
  const byName = Object.fromEntries(departments.map((department) => [department.name, department]));

  const users = await User.create([
    { name: 'Amina Otieno', email: 'admin@labos.local', password: 'LabOS@12345', role: ROLES.ADMIN, departmentId: byName.Haematology._id },
    { name: 'Peter Mwangi', email: 'manager@labos.local', password: 'LabOS@12345', role: ROLES.MANAGER, departmentId: byName.Biochemistry._id },
    { name: 'Grace Wanjiku', email: 'haem.staff@labos.local', password: 'LabOS@12345', role: ROLES.STAFF, departmentId: byName.Haematology._id },
    { name: 'Brian Kiptoo', email: 'micro.staff@labos.local', password: 'LabOS@12345', role: ROLES.STAFF, departmentId: byName.Microbiology._id },
    { name: 'Linet Achieng', email: 'phleb.staff@labos.local', password: 'LabOS@12345', role: ROLES.STAFF, departmentId: byName.Phlebotomy._id }
  ]);

  const items = await InventoryItem.insertMany(itemSeed.map((item, index) => ({
    name: item[0],
    category: item[1],
    unit: item[2],
    quantity: item[3],
    minThreshold: item[4],
    expiryDate: new Date(item[5]),
    supplier: item[6],
    location: item[7],
    departmentId: departments[index % departments.length]._id
  })));

  await StockMovement.insertMany(items.map((item) => ({
    itemId: item._id,
    type: 'in',
    quantity: item.quantity,
    performedBy: users[0]._id,
    departmentId: item.departmentId,
    notes: 'Seed opening balance'
  })));

  const requests = await Request.insertMany([
    { itemId: items[0]._id, requestedBy: users[2]._id, departmentId: byName.Haematology._id, requestedQuantity: 5, approvedQuantity: 5, status: 'approved', urgency: 'routine', approvedBy: users[1]._id, approvedAt: new Date() },
    { itemId: items[1]._id, requestedBy: users[3]._id, departmentId: byName.Microbiology._id, requestedQuantity: 30, approvedQuantity: 18, status: 'partially_approved', urgency: 'critical', adjustedBy: users[1]._id, adjustmentReason: 'Issued available balance pending restock', approvedBy: users[1]._id, approvedAt: new Date() },
    { itemId: items[4]._id, requestedBy: users[2]._id, departmentId: byName.Biochemistry._id, requestedQuantity: 3, status: 'pending', urgency: 'urgent' },
    { itemId: items[7]._id, requestedBy: users[4]._id, departmentId: byName.Phlebotomy._id, requestedQuantity: 20, status: 'pending', urgency: 'routine' }
  ]);

  await AuditLog.create({ action: 'system.seeded', userId: users[0]._id, after: { departments: departments.length, users: users.length, items: items.length, requests: requests.length } });
  console.log('LabOS seed complete');
  console.table([
    { role: 'Admin', email: 'admin@labos.local', password: 'LabOS@12345' },
    { role: 'Commodity Manager', email: 'manager@labos.local', password: 'LabOS@12345' },
    { role: 'Lab Staff', email: 'haem.staff@labos.local', password: 'LabOS@12345' }
  ]);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
