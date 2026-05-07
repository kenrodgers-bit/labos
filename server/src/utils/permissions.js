export const ROLES = {
  ADMIN: 'admin',
  // LabOS fix: keep the production role model to Admin and Staff only.
  STAFF: 'staff'
};

const LEGACY_STAFF_ROLES = new Set(['lab_staff', 'commodity_manager']);

export function isStaffRole(role) {
  return role === ROLES.STAFF || LEGACY_STAFF_ROLES.has(role);
}

export function normalizedRole(role) {
  return isStaffRole(role) ? ROLES.STAFF : role;
}

export const defaultPermissions = {
  admin: ['*'],
  // LabOS fix: staff are read/request-only and cannot access reports or audit logs.
  staff: ['inventory:read', 'requests:create', 'requests:own']
};

export function hasPermission(user, permission) {
  const rolePermissions = user?.permissions?.length ? user.permissions : defaultPermissions[normalizedRole(user?.role)] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}
