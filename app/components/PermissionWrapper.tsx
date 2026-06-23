'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionWrapperProps {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
  requireAll?: string[]; // Array of permissions that ALL must be true
  requireAny?: string[]; // Array of permissions where ANY must be true
  invert?: boolean; // Show children when permission is false
}

export default function PermissionWrapper({
  children,
  permission,
  fallback = null,
  requireAll,
  requireAny,
  invert = false
}: PermissionWrapperProps) {
  const { hasPermission } = usePermissions();

  // Check single permission
  if (permission) {
    const hasPerm = hasPermission(permission);
    const shouldShow = invert ? !hasPerm : hasPerm;

    return shouldShow ? <>{children}</> : <>{fallback}</>;
  }

  // Check requireAll - all permissions must be true
  if (requireAll && requireAll.length > 0) {
    const hasAllPerms = requireAll.every(perm => hasPermission(perm));
    const shouldShow = invert ? !hasAllPerms : hasAllPerms;

    return shouldShow ? <>{children}</> : <>{fallback}</>;
  }

  // Check requireAny - at least one permission must be true
  if (requireAny && requireAny.length > 0) {
    const hasAnyPerm = requireAny.some(perm => hasPermission(perm));
    const shouldShow = invert ? !hasAnyPerm : hasAnyPerm;

    return shouldShow ? <>{children}</> : <>{fallback}</>;
  }

  // No permission checks specified, show children
  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper permission="canAccessUserManagement" fallback={fallback}>
      {children}
    </PermissionWrapper>
  );
}

export function StaffOrHigher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper
      requireAny={['canAccessUserManagement', 'appointments.canCreate']}
      fallback={fallback}
    >
      {children}
    </PermissionWrapper>
  );
}

export function VetOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper
      requireAll={['patients.canUpdate', 'aiFeatures.canUseTreatmentRecommendations']}
      fallback={fallback}
    >
      {children}
    </PermissionWrapper>
  );
}
