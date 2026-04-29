import AuditLog from '../models/AuditLog.js';

export async function writeAudit({ action, userId, itemId, requestId, before, after, departmentId, req }) {
  return AuditLog.create({
    action,
    userId,
    itemId,
    requestId,
    departmentId,
    before,
    after,
    ipAddress: req?.ip,
    userAgent: req?.headers?.['user-agent']
  });
}
