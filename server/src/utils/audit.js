import AuditLog from '../models/AuditLog.js';

function publicObject(value) {
  if (!value) return value;
  const plain = value.toObject ? value.toObject() : { ...value };
  delete plain.password;
  delete plain.passwordHash;
  delete plain.__v;
  return plain;
}

export async function writeAudit({
  action,
  performedBy,
  targetUserId,
  targetItemId,
  targetRequestId,
  departmentId,
  before,
  after,
  req,
  userId,
  itemId,
  requestId
}) {
  const actor = performedBy || userId || req?.user?._id;
  const targetItem = targetItemId || itemId;
  const targetRequest = targetRequestId || requestId;

  return AuditLog.create({
    action,
    performedBy: actor,
    targetUserId,
    targetItemId: targetItem,
    targetRequestId: targetRequest,
    departmentId,
    before: publicObject(before),
    after: publicObject(after),
    ipAddress: req?.ip,
    userAgent: req?.headers?.['user-agent'],
    userId: actor,
    itemId: targetItem,
    requestId: targetRequest
  });
}
