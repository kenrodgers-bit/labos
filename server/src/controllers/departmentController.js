import Department from '../models/Department.js';
import { writeAudit } from '../utils/audit.js';

export async function listDepartments(req, res) {
  res.json(await Department.find().sort({ name: 1 }));
}

export async function upsertDepartment(req, res) {
  const before = req.params.id ? await Department.findById(req.params.id) : null;
  const payload = {
    ...req.body,
    permissions: typeof req.body.permissions === 'string'
      ? req.body.permissions.split(',').map((permission) => permission.trim()).filter(Boolean)
      : req.body.permissions
  };
  const department = req.params.id
    ? await Department.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    : await Department.create(payload);
  await writeAudit({ action: before ? 'department.updated' : 'department.created', userId: req.user._id, departmentId: department._id, before, after: department, req });
  res.status(before ? 200 : 201).json(department);
}
