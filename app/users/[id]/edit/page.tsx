'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Mail,
  Shield,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: 'veterinarian' | 'admin' | 'staff' | 'receptionist';
  specialization?: string;
  licenseNumber?: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'veterinarian' as 'veterinarian' | 'admin' | 'staff' | 'receptionist',
    specialization: '',
    licenseNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            password: '',
            role: data.role || 'veterinarian',
            specialization: data.specialization || '',
            licenseNumber: data.licenseNumber || ''
          });
        } else {
          alert('Failed to fetch user');
          router.push('/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('Failed to fetch user');
        router.push('/users');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
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
      alert('Access denied. Admin privileges required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if it's being changed
      if (formData.password) {
        userData.password = formData.password;
      }

      if (formData.specialization) {
        userData.specialization = formData.specialization;
      }

      if (formData.licenseNumber) {
        userData.licenseNumber = formData.licenseNumber;
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert('User updated successfully!');
        router.push('/users');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Edit User" description="Update user information">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Access Denied" description="Admin access required">
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-700">Admin privileges are required to access this page.</p>
            <div className="mt-6">
              <Link
                href="/users"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Users</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="User Not Found" description="The requested user could not be found">
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
            <div className="mt-6">
              <Link
                href="/users"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Users</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title="Edit User" description="Update user information">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/users"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-emerald-600 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
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
                    Email *
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
                    Role *
                  </label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="veterinarian">Veterinarian</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to keep the current password
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information (for veterinarians) */}
            {(formData.role === 'veterinarian') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="e.g., Small Animals, Exotic Pets"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., VET-2024-001"
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
                Cancel
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
                {isSubmitting ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

