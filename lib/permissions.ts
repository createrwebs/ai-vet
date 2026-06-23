export type UserRole = 'admin' | 'veterinarian' | 'staff' | 'receptionist';

export interface Permissions {
  // Navigation permissions
  canAccessUserManagement: boolean;
  canAccessSettings: boolean;
  canAccessAISettings: boolean;

  // CRUD permissions for different entities
  users: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  patients: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  pets: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  owners: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  appointments: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  reports: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };

  // AI features permissions
  aiFeatures: {
    canUseTreatmentRecommendations: boolean;
    canUseDrugInteraction: boolean;
    canUseMedicalImage: boolean;
    canUseAppointmentOptimizer: boolean;
    canUseRiskAssessment: boolean;
    canUseHealthTrends: boolean;
    canUseVoiceInput: boolean;
    canUseHealthAnalytics: boolean;
    canUseAssistant: boolean;
  };
}

const rolePermissions: Record<UserRole, Permissions> = {
  admin: {
    // Admin has full access to everything
    canAccessUserManagement: true,
    canAccessSettings: true,
    canAccessAISettings: true,

    users: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    patients: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    pets: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    owners: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    appointments: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    reports: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    aiFeatures: {
      canUseTreatmentRecommendations: true,
      canUseDrugInteraction: true,
      canUseMedicalImage: true,
      canUseAppointmentOptimizer: true,
      canUseRiskAssessment: true,
      canUseHealthTrends: true,
      canUseVoiceInput: true,
      canUseHealthAnalytics: true,
      canUseAssistant: true,
    },
  },

  veterinarian: {
    // Veterinarians have access to medical features and patient management
    canAccessUserManagement: false,
    canAccessSettings: false,
    canAccessAISettings: false,

    users: {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    patients: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    pets: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    owners: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false, // Can't delete owners
    },
    appointments: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    reports: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    aiFeatures: {
      canUseTreatmentRecommendations: true,
      canUseDrugInteraction: true,
      canUseMedicalImage: true,
      canUseAppointmentOptimizer: true,
      canUseRiskAssessment: true,
      canUseHealthTrends: true,
      canUseVoiceInput: true,
      canUseHealthAnalytics: true,
      canUseAssistant: true,
    },
  },

  staff: {
    // Staff have moderate access - can manage appointments and basic operations
    canAccessUserManagement: false,
    canAccessSettings: false,
    canAccessAISettings: false,

    users: {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    patients: {
      canRead: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
    },
    pets: {
      canRead: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
    },
    owners: {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    appointments: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    reports: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    aiFeatures: {
      canUseTreatmentRecommendations: false,
      canUseDrugInteraction: false,
      canUseMedicalImage: false,
      canUseAppointmentOptimizer: true,
      canUseRiskAssessment: false,
      canUseHealthTrends: false,
      canUseVoiceInput: false,
      canUseHealthAnalytics: false,
      canUseAssistant: false,
    },
  },

  receptionist: {
    // Receptionists have basic access - mainly for scheduling and basic data entry
    canAccessUserManagement: false,
    canAccessSettings: false,
    canAccessAISettings: false,

    users: {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    patients: {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    pets: {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    owners: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    appointments: {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false, // Can't delete appointments
    },
    reports: {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    aiFeatures: {
      canUseTreatmentRecommendations: false,
      canUseDrugInteraction: false,
      canUseMedicalImage: false,
      canUseAppointmentOptimizer: false,
      canUseRiskAssessment: false,
      canUseHealthTrends: false,
      canUseVoiceInput: false,
      canUseHealthAnalytics: false,
      canUseAssistant: false,
    },
  },
};

export function getPermissionsForRole(role: UserRole): Permissions {
  return rolePermissions[role] || rolePermissions.receptionist; // Default to receptionist if role not found
}

export function hasPermission(role: UserRole | undefined, permissionPath: string): boolean {
  if (!role) return false;

  const permissions = getPermissionsForRole(role);
  const pathParts = permissionPath.split('.');

  let current: any = permissions;
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return Boolean(current);
}

// Convenience functions for common checks
export function canAccessUserManagement(role: UserRole | undefined): boolean {
  return hasPermission(role, 'canAccessUserManagement');
}

export function canAccessSettings(role: UserRole | undefined): boolean {
  return hasPermission(role, 'canAccessSettings');
}

export function canAccessAISettings(role: UserRole | undefined): boolean {
  return hasPermission(role, 'canAccessAISettings');
}

// CRUD permission helpers
export function canRead(resource: string, role: UserRole | undefined): boolean {
  return hasPermission(role, `${resource}.canRead`);
}

export function canCreate(resource: string, role: UserRole | undefined): boolean {
  return hasPermission(role, `${resource}.canCreate`);
}

export function canUpdate(resource: string, role: UserRole | undefined): boolean {
  return hasPermission(role, `${resource}.canUpdate`);
}

export function canDelete(resource: string, role: UserRole | undefined): boolean {
  return hasPermission(role, `${resource}.canDelete`);
}

// AI feature helpers
export function canUseAIFeature(feature: string, role: UserRole | undefined): boolean {
  return hasPermission(role, `aiFeatures.canUse${feature}`);
}
