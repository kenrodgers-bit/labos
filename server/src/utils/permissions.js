export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'commodity_manager',
  STAFF: 'lab_staff'
};

export const defaultPermissions = {
  admin: ['*'],
  commodity_manager: ['inventory:read', 'requests:read', 'requests:approve', 'reports:read', 'audit:read'],
  lab_staff: ['inventory:read', 'requests:create', 'requests:own', 'reports:own']
};

export function hasPermission(user, permission) {
  const rolePermissions = user?.permissions?.length ? user.permissions : defaultPermissions[user?.role] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}
