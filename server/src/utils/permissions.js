export const ROLES = {
  ADMIN: 'admin',
  // LabOS fix: keep the production role model to Admin and Staff only.
  STAFF: 'staff'
};

export const defaultPermissions = {
  admin: ['*'],
  // LabOS fix: staff are read/request-only and cannot access reports or audit logs.
  staff: ['inventory:read', 'requests:create', 'requests:own']
};

export function hasPermission(user, permission) {
  const rolePermissions = user?.permissions?.length ? user.permissions : defaultPermissions[user?.role] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}
