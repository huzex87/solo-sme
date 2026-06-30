import { DEFAULT_PERMISSIONS, StaffMember } from '@/services/staffService';

// Maps routes to required permissions
const PATH_PERMISSIONS: Record<string, string> = {
  '/dashboard/whatsapp': 'settings:view',
  '/dashboard/import': 'products:edit',
  '/dashboard/products': 'products:view',
  '/dashboard/orders': 'orders:view',
  '/dashboard/pos': 'pos:access',
  '/dashboard/analytics': 'analytics:view',
  '/dashboard/marketing': 'marketing:view',
  '/dashboard/customers': 'customers:view',
  '/dashboard/settings': 'settings:view',
  '/dashboard/staff': 'staff:view',
};

export function hasRoutePermission(role: string, pathname: string): boolean {
  // If no role is provided or the user is the owner, grant full access
  if (!role || role === 'owner') return true;

  // Find the longest matching path prefix
  const matchedPath = Object.keys(PATH_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(path => pathname === path || pathname.startsWith(path + '/'));

  if (!matchedPath) return true;

  const requiredPermission = PATH_PERMISSIONS[matchedPath];
  const permissions = DEFAULT_PERMISSIONS[role as StaffMember['role']] || [];
  
  return permissions.includes(requiredPermission as any);
}
