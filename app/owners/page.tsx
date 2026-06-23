'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  PawPrint,
  MapPin
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

interface Owner {
  _id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function OwnersPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners');
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ownerId: string, ownerName: string) => {
    if (!confirm(t('owners.delete.confirm', { name: ownerName }))) {
      return;
    }

    try {
      const response = await fetch(`/api/owners/${ownerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOwners(owners.filter(o => o._id !== ownerId));
        alert(t('owners.delete.success'));
      } else {
        const error = await response.json();
        alert(error.error || t('owners.delete.error'));
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
      alert(t('owners.delete.error'));
    }
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = 
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.phone.includes(searchTerm) ||
      owner.ownerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || owner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('owners.title')} description={t('owners.description')}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title={t('owners.title')} description={t('owners.description')}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <span className="text-sm text-gray-500">{t('owners.ownersCount', { count: filteredOwners.length })}</span>
          </div>
          <Link
            href="/owners/new"
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('owners.addNewOwner')}</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('owners.searchOwners')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">{t('owners.allStatus')}</option>
              <option value="active">{t('owners.active')}</option>
              <option value="inactive">{t('owners.inactive')}</option>
            </select>
          </div>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owners.owner')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owners.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owners.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owners.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owners.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('owners.noOwnersFound')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? t('owners.tryAdjustingSearch') : t('owners.getStartedAdding')}
                    </p>
                    {!searchTerm && (
                      <div className="mt-4">
                        <Link
                          href="/owners/new"
                          className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('owners.addNewOwner')}</span>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr 
                    key={owner._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/owners/${owner._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {owner.firstName} {owner.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {owner.ownerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {owner.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {owner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {owner.city || owner.state ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {[owner.city, owner.state].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t('common.notSpecified', { defaultValue: 'Not specified' })}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        owner.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {owner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/owners/${owner._id}`)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title={t('owners.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/owners/${owner._id}/edit`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={t('owners.editOwner')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(owner._id, `${owner.firstName} ${owner.lastName}`)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

