import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import dbConnect from './mongodb';
import User from '../models/User';
import { getPermissionsForRole, hasPermission } from './permissions';
import type { UserRole } from './permissions';

export interface AuthResult {
  user: any;
  permissions: ReturnType<typeof getPermissionsForRole>;
  hasPermission: (permissionPath: string) => boolean;
}

export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    throw new Error('User not found');
  }

  const permissions = getPermissionsForRole(user.role as UserRole);

  return {
    user,
    permissions,
    hasPermission: (permissionPath: string) => hasPermission(user.role as UserRole, permissionPath)
  };
}

export async function requirePermission(permissionPath: string): Promise<AuthResult> {
  const auth = await requireAuth();

  if (!auth.hasPermission(permissionPath)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return auth;
}

export async function requireAnyPermission(permissionPaths: string[]): Promise<AuthResult> {
  const auth = await requireAuth();

  const hasAnyPermission = permissionPaths.some(path => auth.hasPermission(path));

  if (!hasAnyPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return auth;
}
