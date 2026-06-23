'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  Stethoscope,
  Users as UsersIcon,
  UserCircle
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: 'veterinarian' | 'admin' | 'staff' | 'receptionist';
  specialization?: string;
  licenseNumber?: string;
  createdAt: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return Shield;
    case 'veterinarian':
      return Stethoscope;
    case 'receptionist':
      return UserCircle;
    default:
      return UsersIcon;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'veterinarian':
      return 'bg-emerald-100 text-emerald-800';
    case 'receptionist':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      setError(t('users.accessDeniedMessage'));
      setLoading(false);
      return;
    }

    fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        setError(t('users.accessDeniedMessage'));
      } else {
        setError(t('users.fetchError', { defaultValue: 'Failed to fetch users' }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(t('users.fetchError', { defaultValue: 'Failed to fetch users' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(t('users.delete.confirm', { name: userName }))) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        alert(t('users.delete.success'));
      } else {
        const error = await response.json();
        alert(error.error || t('users.delete.error'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('users.delete.error'));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('users.title')} description={t('users.manageSystemUsers')}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || session?.user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('users.accessDenied')} description={t('users.adminAccessRequired')}>
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('users.accessDenied')}</h3>
            <p className="mt-1 text-sm text-gray-700">{error || t('users.adminPrivilegesRequired')}</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <span>{t('users.backToDashboard')}</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title={t('users.title')} description={t('users.description')}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <span className="text-sm text-gray-500">{t('users.usersCount', { count: filteredUsers.length })}</span>
          </div>
          <Link
            href="/users/new"
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('users.addNewUser')}</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('users.searchUsers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">{t('users.allRoles')}</option>
              <option value="admin">{t('users.admin')}</option>
              <option value="veterinarian">{t('users.veterinarian')}</option>
              <option value="staff">{t('users.staff')}</option>
              <option value="receptionist">{t('users.receptionist')}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.details')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('users.noUsersFound')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? t('users.tryAdjustingSearch') : t('users.getStartedAdding')}
                    </p>
                    {!searchTerm && (
                      <div className="mt-4">
                        <Link
                          href="/users/new"
                          className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('users.addNewUser')}</span>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {t(`users.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {user.specialization && (
                            <div>{t('users.specialization')}: {user.specialization}</div>
                          )}
                          {user.licenseNumber && (
                            <div>{t('users.license')}: {user.licenseNumber}</div>
                          )}
                          {!user.specialization && !user.licenseNumber && (
                            <span className="text-gray-400">{t('users.noAdditionalDetails')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/users/${user._id}/edit`)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title={t('users.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title={t('users.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

