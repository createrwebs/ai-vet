'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Phone, 
  Mail, 
  MapPin,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

export default function NewOwnerPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    preferredContactMethod: 'phone',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert(t('owners.newOwner.validation.requiredFields'));
      setIsSubmitting(false);
      return;
    }

    try {
      const ownerData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod,
        status: 'active'
      };

      if (formData.alternatePhone) ownerData.alternatePhone = formData.alternatePhone;
      if (formData.address) ownerData.address = formData.address;
      if (formData.city) ownerData.city = formData.city;
      if (formData.state) ownerData.state = formData.state;
      if (formData.zipCode) ownerData.zipCode = formData.zipCode;
      if (formData.notes) ownerData.notes = formData.notes;
      
      if (formData.emergencyName || formData.emergencyPhone) {
        ownerData.emergencyContact = {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRelationship
        };
      }

      const response = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData),
      });

      if (response.ok) {
        alert(t('owners.newOwner.success.ownerAdded'));
        router.push('/owners');
      } else {
        const error = await response.json();
        alert(error.error || t('owners.newOwner.errors.genericError'));
      }
    } catch (error) {
      console.error('Error adding owner:', error);
      alert(t('owners.newOwner.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout title={t('owners.newOwner.title')} description={t('owners.newOwner.description')}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/owners"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('owners.newOwner.backToOwners')}
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-emerald-600 mr-2" />
                {t('owners.newOwner.personalInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.firstName')} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.lastName')} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    {t('owners.newOwner.fields.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    {t('owners.newOwner.fields.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('owners.newOwner.placeholders.phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.alternatePhone')}
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.preferredContactMethod')}
                  </label>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="phone">{t('owners.newOwner.options.phone')}</option>
                    <option value="email">{t('owners.newOwner.options.email')}</option>
                    <option value="sms">{t('owners.newOwner.options.sms')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                {t('owners.newOwner.address')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.streetAddress')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.city')}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.state')}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.zipCode')}
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                {t('owners.newOwner.emergencyContact')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.emergencyName')}
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.emergencyPhone')}
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('owners.newOwner.fields.emergencyRelationship')}
                  </label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    placeholder={t('owners.newOwner.placeholders.emergencyRelationship')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('owners.newOwner.additionalNotes')}</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder={t('owners.newOwner.fields.notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/owners"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('owners.newOwner.buttons.cancel')}
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
                {isSubmitting ? t('owners.newOwner.buttons.saving') : t('owners.newOwner.buttons.saveOwner')}
              </button>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

