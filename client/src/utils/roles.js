const LEGACY_STAFF_ROLES = new Set(['lab_staff', 'commodity_manager']);

export function isStaffRole(role) {
  return role === 'staff' || LEGACY_STAFF_ROLES.has(role);
}

export function normalizedRole(role) {
  return isStaffRole(role) ? 'staff' : role;
}
