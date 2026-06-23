import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import {
  getPermissionsForRole,
  hasPermission,
  canAccessUserManagement,
  canAccessSettings,
  canAccessAISettings,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  canUseAIFeature,
  type UserRole,
  type Permissions
} from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role as UserRole;

  const permissions = useMemo(() => {
    if (!role) return null;
    return getPermissionsForRole(role);
  }, [role]);

  return {
    role,
    permissions,
    hasPermission: (permissionPath: string) => hasPermission(role, permissionPath),

    // Navigation permissions
    canAccessUserManagement: canAccessUserManagement(role),
    canAccessSettings: canAccessSettings(role),
    canAccessAISettings: canAccessAISettings(role),

    // CRUD permissions
    canRead: (resource: string) => canRead(resource, role),
    canCreate: (resource: string) => canCreate(resource, role),
    canUpdate: (resource: string) => canUpdate(resource, role),
    canDelete: (resource: string) => canDelete(resource, role),

    // AI features
    canUseAIFeature: (feature: string) => canUseAIFeature(feature, role),

    // Common permission checks
    canManageUsers: canAccessUserManagement(role),
    canViewReports: canRead('reports', role),
    canCreateReports: canCreate('reports', role),
    canManageAppointments: canCreate('appointments', role),
    canViewPatients: canRead('patients', role),
    canManagePatients: canCreate('patients', role),
  };
}
