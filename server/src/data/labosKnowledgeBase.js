import { ROLES } from '../utils/permissions.js';

export const SECURITY_REPLY = 'For security reasons, I can\'t share login credentials. Please contact the system administrator or use the official demo guide.';

export const roleSuggestions = {
  [ROLES.ADMIN]: [
    'How do I create staff accounts?',
    'How do I change my password?',
    'How do I approve partial quantity?',
    'How do I export reports?',
    'How do audit logs work?'
  ],
  [ROLES.STAFF]: [
    'How do I request an item?',
    'How do I track my request?',
    'Why was my quantity reduced?',
    'What does pending mean?'
  ]
}; // LabOS fix: LabOS Assist suggestions match the two-role model only.

export const fallbackReply = 'I can help with LabOS inventory, requests, approvals, reports, audit logs, settings, and stock alerts. Try asking about one of those areas.';

export const knowledgeBase = [
  {
    id: 'security',
    title: 'Security rules',
    keywords: ['credentials', 'login details', 'token', 'jwt', 'secret', 'env', 'environment', 'database url', 'connection string', 'hash', 'demo login'],
    roles: Object.values(ROLES),
    reply: SECURITY_REPLY,
    suggestions: ['How do I change my password?', 'How do I contact an administrator?']
  },
  {
    id: 'authentication',
    title: 'Authentication',
    keywords: ['sign in', 'login', 'cannot login', 'account inactive', 'locked out', 'authentication'],
    roles: Object.values(ROLES),
    reply: 'Use the email and password issued by your LabOS administrator. If your account is inactive or you cannot sign in, contact an administrator to check your account status or reset your password.',
    suggestions: ['How do I change my password?', 'What does inactive account mean?']
  },
  {
    id: 'profile',
    title: 'Profile settings',
    keywords: ['profile', 'settings', 'change my name', 'change email', 'change password', 'change my password', 'reset my password', 'own password'],
    roles: Object.values(ROLES),
    reply: 'Open Settings to update your profile. All users can update their full name and change their password with the current password. Admins can also update their own email address immediately.',
    suggestions: ['How do I change my password?', 'Can I change my email?']
  },
  {
    id: 'staff-management',
    title: 'Staff management',
    keywords: ['staff', 'create user', 'create account', 'edit staff', 'deactivate', 'reactivate', 'reset password', 'assign role', 'assign department'],
    roles: [ROLES.ADMIN],
    reply: 'Admins manage accounts from the Staff page. You can create accounts, edit names and emails, assign Admin or Staff roles, assign departments to Staff, activate or deactivate users, and reset passwords. Changes take effect immediately.',
    suggestions: ['How do I reset staff passwords?', 'How do I deactivate a user?']
  },
  {
    id: 'staff-management-restricted',
    title: 'Staff management restricted',
    keywords: ['staff', 'create user', 'create account', 'edit staff', 'deactivate', 'reactivate', 'reset password', 'assign role', 'assign department'],
    roles: [ROLES.STAFF],
    reply: 'Staff account management is restricted to Admin users. Ask an administrator to create accounts, change roles, reset passwords, or reactivate inactive users.',
    suggestions: ['How do I change my password?', 'How do I update my profile?']
  },
  {
    id: 'inventory',
    title: 'Inventory management',
    keywords: ['inventory', 'item', 'add item', 'edit item', 'deactivate item', 'category', 'supplier', 'location', 'stock'],
    roles: Object.values(ROLES),
    reply: 'Use Inventory to search items, filter by department/category/status, and view quantity, expiry, supplier, and location. Admins can add, edit, and deactivate items. Staff have read-only inventory access.',
    suggestions: ['How do low stock alerts work?', 'How do I request an item?']
  },
  {
    id: 'request-workflow',
    title: 'Request workflow',
    keywords: ['request item', 'new request', 'request commodity', 'track request', 'my request', 'pending', 'approved', 'rejected'],
    roles: Object.values(ROLES),
    reply: 'Staff open Requests to submit commodity requests and track status. Admins can view all requests and make decisions. Pending means the request is awaiting Admin review.',
    suggestions: ['What does pending mean?', 'Why was my quantity reduced?']
  },
  {
    id: 'approval-workflow',
    title: 'Approval workflow',
    keywords: ['approve request', 'reject request', 'pending approvals', 'approval queue', 'decision'],
    roles: [ROLES.ADMIN],
    reply: 'Open Approvals to review pending staff requests. You can approve the full quantity, reject the request with a reason, or make a partial release. Stock reduces only after approval.',
    suggestions: ['How do partial releases work?', 'Why do I need an adjustment reason?']
  },
  {
    id: 'approval-workflow-restricted',
    title: 'Approval workflow restricted',
    keywords: ['approve request', 'reject request', 'pending approvals', 'approval queue', 'decision'],
    roles: [ROLES.STAFF],
    reply: 'Approvals are handled by Admin users. As Staff, use Requests to submit items and track whether they are pending, approved, partially approved, or rejected.',
    suggestions: ['How do I track my request?', 'What does pending mean?']
  },
  {
    id: 'partial-release',
    title: 'Partial release logic',
    keywords: ['partial', 'partial approval', 'partial release', 'partial quantity', 'approve partial quantity', 'adjust', 'approved quantity', 'reduced', 'quantity reduced', 'adjustment reason'],
    roles: Object.values(ROLES),
    reply: 'A partial release means Admin issued less than the requested quantity. LabOS stores requested quantity, approved quantity, adjustment reason, approver, and timestamp for audit review.',
    suggestions: ['Why do I need an adjustment reason?', 'How do audit logs work?']
  },
  {
    id: 'departments',
    title: 'Departments',
    keywords: ['department', 'haematology', 'microbiology', 'biochemistry', 'phlebotomy', 'section'],
    roles: Object.values(ROLES),
    reply: 'Departments group Staff, inventory, requests, and reports by laboratory section. Admin accounts do not have departments. Admins manage departments and assign Staff from Staff or Departments.',
    suggestions: ['How do I assign a department?', 'How do department reports work?']
  },
  {
    id: 'stock-movement',
    title: 'Stock movement',
    keywords: ['stock movement', 'stock in', 'stock out', 'movement summary', 'adjustment', 'issued stock'],
    roles: Object.values(ROLES),
    reply: 'Stock movements record stock in, stock out, and manual adjustments. Approved or partially approved requests create stock-out records automatically.',
    suggestions: ['How do partial releases work?', 'How do I export usage reports?']
  },
  {
    id: 'audit-logs',
    title: 'Audit logs',
    keywords: ['audit', 'logs', 'who approved', 'who changed', 'trace', 'history'],
    roles: [ROLES.ADMIN],
    reply: 'Audit Logs show sensitive actions such as logins, failed logins, staff changes, password resets, inventory updates, and request decisions. Use search and action filters to trace activity.',
    suggestions: ['How do I export audit logs?', 'How do partial releases appear?']
  },
  {
    id: 'audit-logs-restricted',
    title: 'Audit logs restricted',
    keywords: ['audit', 'logs', 'who approved', 'who changed', 'trace', 'history'],
    roles: [ROLES.STAFF],
    reply: 'Audit logs are visible to Admin users. For your own request history, open Requests and review status, approved quantity, and adjustment reason.',
    suggestions: ['How do I track my request?', 'Why was my quantity reduced?']
  },
  {
    id: 'reports',
    title: 'Reports',
    keywords: ['report', 'export', 'pdf', 'excel', 'download', 'inventory report', 'request report', 'usage report', 'department usage'],
    roles: [ROLES.ADMIN],
    reply: 'Open Reports to export inventory, low stock, expiry, request, usage, department usage, audit, and MOH 706 reports. PDF and Excel downloads use your authenticated session.',
    suggestions: ['What reports are available?', 'What is the MOH 706 report?']
  },
  {
    id: 'reports-restricted',
    title: 'Reports restricted',
    keywords: ['report', 'export', 'pdf', 'excel', 'download', 'inventory report', 'request report', 'usage report', 'department usage'],
    roles: [ROLES.STAFF],
    reply: 'Reports are restricted to Admin users. Staff can view inventory and their own request history from the Inventory and Requests screens.',
    suggestions: ['How do I track my request?', 'How do low stock alerts work?']
  },
  {
    id: 'moh706',
    title: 'MOH 706 monthly report',
    keywords: ['moh', '706', 'monthly report', 'monthly summary'],
    roles: Object.values(ROLES),
    reply: 'The MOH 706 monthly report summarizes test counts, commodities used, stock balances, and totals for a selected month. Admins export it from Reports as a PDF.',
    suggestions: ['How do I export reports?', 'What data appears in MOH 706?']
  },
  {
    id: 'low-stock-alerts',
    title: 'Low stock alerts',
    keywords: ['low stock', 'threshold', 'out of stock', 'minimum', 'stock alert'],
    roles: Object.values(ROLES),
    reply: 'Low stock alerts appear when quantity is at or below the item minimum threshold. Out-of-stock items show separately when quantity reaches zero.',
    suggestions: ['How do I edit item thresholds?', 'How do I export low stock reports?']
  },
  {
    id: 'expiry-alerts',
    title: 'Expiry alerts',
    keywords: ['expiry', 'expired', 'expires', 'expiry alert', 'near expiry'],
    roles: Object.values(ROLES),
    reply: 'Expiry alerts identify expired items and items expiring within 30 days so the laboratory can prioritize use, quarantine, or replacement according to facility policy.',
    suggestions: ['How do I export expiry reports?', 'How do I edit an expiry date?']
  },
  {
    id: 'lan-deployment',
    title: 'LAN deployment',
    keywords: ['lan', 'local network', 'server pc', 'offline', 'same network', 'local ip'],
    roles: [ROLES.ADMIN],
    reply: 'For LAN use, run the backend on one server PC, set the frontend API URL to that PC IP address, and let other devices on the same network open the frontend URL. Keep MongoDB on the server PC or a controlled database host.',
    suggestions: ['How do I configure system settings?', 'How do I secure LabOS on LAN?']
  },
  {
    id: 'system-settings',
    title: 'System settings',
    keywords: ['system settings', 'hospital name', 'facility code', 'county', 'sub-county', 'contact email', 'contact phone', 'logo'],
    roles: [ROLES.ADMIN],
    reply: 'Admins update hospital name, facility code, county, sub-county, contact details, logo URL, and low-stock alert behavior from Settings.',
    suggestions: ['How do I change my email?', 'How do low stock alerts work?']
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    keywords: ['not working', 'error', 'unable', 'network error', 'database unavailable', 'cannot load'],
    roles: Object.values(ROLES),
    reply: 'Check that the LabOS API is online, your account is active, and your network can reach the server. If you see database unavailable, ask technical support to check MongoDB connectivity and server environment settings.',
    suggestions: ['Why can\'t I sign in?', 'How do I contact an administrator?']
  }
]; // LabOS fix: the assistant knowledge base is role-aware, read-only, and credential-safe for Admin and Staff only.
