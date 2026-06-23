'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Mail,
  Shield,
  Stethoscope,
  Users as UsersIcon,
  UserCircle,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

export default function NewUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'veterinarian' as 'veterinarian' | 'admin' | 'staff' | 'receptionist',
    specialization: '',
    licenseNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('users.newUser.validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('users.newUser.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('users.newUser.validation.emailInvalid');
    }

    if (!formData.role) {
      newErrors.role = t('users.newUser.validation.roleRequired');
    }

    // Password is optional (will use default if not provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t('users.newUser.validation.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (session?.user?.role !== 'admin') {
      alert(t('users.accessDeniedMessage'));
      return;
    }

    setIsSubmitting(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (formData.specialization) {
        userData.specialization = formData.specialization;
      }

      if (formData.licenseNumber) {
        userData.licenseNumber = formData.licenseNumber;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert(t('users.newUser.success.userAdded'));
        router.push('/users');
      } else {
        const error = await response.json();
        alert(error.error || t('users.newUser.errors.genericError'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert(t('users.newUser.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session?.user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('users.accessDenied')} description={t('users.adminAccessRequired')}>
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('users.accessDenied')}</h3>
            <p className="mt-1 text-sm text-gray-700">{t('users.adminPrivilegesRequired')}</p>
            <div className="mt-6">
              <Link
                href="/users"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('users.newUser.backToUsers')}</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title={t('users.newUser.title')} description={t('users.newUser.description')}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/users"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('users.newUser.backToUsers')}
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-emerald-600 mr-2" />
                {t('users.newUser.basicInformation', { defaultValue: 'Basic Information' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.newUser.fields.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    {t('users.newUser.fields.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.newUser.fields.role')} *
                  </label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="veterinarian">{t('users.veterinarian')}</option>
                    <option value="admin">{t('users.admin')}</option>
                    <option value="staff">{t('users.staff')}</option>
                    <option value="receptionist">{t('users.receptionist')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.newUser.fields.password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('users.newUser.passwordPlaceholder', { defaultValue: 'Leave blank for default (password123)' })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {t('users.newUser.passwordHint', { defaultValue: 'If left blank, default password will be: password123' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information (for veterinarians) */}
            {(formData.role === 'veterinarian') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                  {t('users.newUser.professionalInformation', { defaultValue: 'Professional Information' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.newUser.fields.specialization')}
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder={t('users.newUser.specializationPlaceholder', { defaultValue: 'e.g., Small Animals, Exotic Pets' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.newUser.fields.licenseNumber')}
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder={t('users.newUser.licensePlaceholder', { defaultValue: 'e.g., VET-2024-001' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/users"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('users.newUser.buttons.cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 flex items-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? t('users.newUser.buttons.saving') : t('users.newUser.buttons.saveUser')}
              </button>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

